"""
DeFraudAI Backend - Security Hardened
Implements secure authentication, rate limiting, input validation, and API proxying
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
import numpy as np
import os
import base64
import requests
import json
import re
from dotenv import load_dotenv
from pathlib import Path
from typing import Optional, List

# Import database functions
from database import (
    connect_to_mongodb,
    close_mongodb_connection,
    create_user,
    authenticate_user,
    get_user_by_id,
    decode_access_token,
    create_access_token,
    save_analysis,
    get_user_analyses,
    get_user_stats,
)

# Load .env from project root (two levels up from src/backend/)
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
print(f"Loading .env from: {env_path}")
print(f".env exists: {env_path.exists()}")
load_dotenv(env_path)
print(f"VITE_GEMINI_API_KEY loaded: {'Yes' if os.environ.get('VITE_GEMINI_API_KEY') else 'No'}")

# ============================================
# Security Configuration
# ============================================

# GEMINI API - Server-side only (never exposed to client)
GEMINI_API_KEY = os.environ.get("VITE_GEMINI_API_KEY", "")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

# CORS Configuration - Restrictive origins
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
ALLOWED_ORIGINS = [origin.strip() for origin in FRONTEND_URL.split(",") if origin.strip()]

# File upload limits
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg", 
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp"
}

# ============================================
# Rate Limiting Setup
# ============================================

limiter = Limiter(key_func=get_remote_address)

# ============================================
# Pydantic Models for Request/Response Validation
# ============================================

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    name: str = Field(..., min_length=1, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class GeminiProxyRequest(BaseModel):
    contents: List[dict]
    model: Optional[str] = "gemini-2.5-flash"
    generationConfig: Optional[dict] = None
    safetySettings: Optional[List[dict]] = None
    systemInstruction: Optional[dict] = None

class GeminiImageAnalysisRequest(BaseModel):
    image_base64: str = Field(..., max_length=10_000_000)  # ~7.5MB base64
    mime_type: str = Field(default="image/jpeg")
    analysis_type: str = Field(default="deepfake")

# ============================================
# Initialize FastAPI with Rate Limiting
# ============================================

app = FastAPI(
    title="DeFraudAI API",
    description="Secure Deepfake Detection API",
    version="2.0.0"
)

# Add rate limit exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Enable CORS with restrictive origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# ============================================
# Security: JWT Authentication Dependency
# ============================================

security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Validate JWT token and return user data"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    return user

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Optional authentication - returns None if no valid token"""
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        if payload and payload.get("sub"):
            return await get_user_by_id(payload["sub"])
    except:
        pass
    return None

# ============================================
# Input Validation Helpers
# ============================================

def validate_file_size(content_length: Optional[int], contents: bytes):
    """Validate file size before processing"""
    actual_size = len(contents)
    if actual_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE_BYTES // (1024*1024)}MB, received {actual_size // (1024*1024)}MB"
        )

def validate_mime_type(content_type: Optional[str], filename: Optional[str] = None):
    """Strictly validate MIME type before processing"""
    if not content_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Content-Type header is required"
        )
    
    # Normalize mime type (remove charset etc)
    mime = content_type.split(";")[0].strip().lower()
    
    if mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {mime}. Allowed types: {', '.join(ALLOWED_MIME_TYPES)}"
        )
    
    # Additional check: validate extension matches MIME if filename provided
    if filename:
        ext = Path(filename).suffix.lower()
        mime_ext_map = {
            ".jpg": ["image/jpeg", "image/jpg"],
            ".jpeg": ["image/jpeg", "image/jpg"],
            ".png": ["image/png"],
            ".gif": ["image/gif"],
            ".webp": ["image/webp"],
            ".bmp": ["image/bmp"]
        }
        expected_mimes = mime_ext_map.get(ext, [])
        if expected_mimes and mime not in expected_mimes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File extension {ext} does not match Content-Type {mime}"
            )
    
    return mime

# ============================================
# Load ML Model
# ============================================

from transformers import pipeline

print("Loading Deepfake Detection Model... (this may take a moment)")
try:
    pipe = pipeline("image-classification", model="dima806/deepfake_vs_real_image_detection")
    print("Model loaded successfully!")
except Exception as e:
    print(f"Failed to load model: {e}")
    pipe = None

# ============================================
# Gemini API Functions (Server-side only)
# ============================================

def analyze_with_gemini(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """Analyze image using Gemini Vision API (server-side only)"""
    if not GEMINI_API_KEY:
        return {"status": "error", "message": "Gemini API key not configured on server"}
    
    base64_image = base64.b64encode(image_bytes).decode('utf-8')
    
    prompt = """Analyze this image for deepfake manipulation or AI generation. 
    
    Look for:
    1. Facial inconsistencies (asymmetry, blurring around edges)
    2. Unnatural skin texture or lighting
    3. Background anomalies
    4. Eye reflections that don't match
    5. Hair/ear boundary artifacts
    6. Signs of AI generation (GAN artifacts, diffusion patterns)
    
    Respond with ONLY a JSON object (no markdown):
    {"is_fake": true/false, "confidence": 0-100, "reasons": ["list", "of", "reasons"]}"""
    
    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inlineData": {"mimeType": mime_type, "data": base64_image}}
            ]
        }],
        "generationConfig": {"temperature": 0.1}
    }
    
    try:
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            text = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "{}")
            json_match = re.search(r'\{[\s\S]*\}', text)
            if json_match:
                return json.loads(json_match.group())
            return {"status": "error", "message": "Failed to parse Gemini response"}
        else:
            return {"status": "error", "message": f"Gemini API error: {response.status_code}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def analyze_with_local_model(image: Image.Image) -> dict:
    """Analyze image using local HuggingFace model"""
    if not pipe:
        return {"status": "error", "message": "Local model not loaded"}
    
    try:
        results = pipe(image)
        fake_score = 0
        real_score = 0
        
        for r in results:
            label = r['label'].lower()
            score = r['score'] * 100
            
            if 'fake' in label:
                fake_score = score
            elif 'real' in label or 'true' in label:
                real_score = score
        
        return {
            "is_fake": fake_score > real_score,
            "confidence": fake_score if fake_score > real_score else real_score,
            "probabilities": {"real": round(real_score, 2), "fake": round(fake_score, 2)}
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ============================================
# Lifecycle Events
# ============================================

@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    await connect_to_mongodb()

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    await close_mongodb_connection()

# ============================================
# Public Endpoints
# ============================================

@app.get("/")
def read_root():
    status_msg = "Deepfake Detection API is running" if pipe else "Model failed to load"
    return {
        "status": status_msg, 
        "model": "dima806/deepfake_vs_real_image_detection",
        "gemini_configured": bool(GEMINI_API_KEY),
        "version": "2.0.0-secure"
    }

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy", "model_loaded": pipe is not None}

# ============================================
# Authentication Endpoints
# ============================================

@app.post("/api/register", response_model=TokenResponse)
@limiter.limit("5/minute")
async def register(request: Request, user_data: UserRegister):
    """Register a new user account"""
    user = await create_user(
        email=user_data.email,
        password=user_data.password,
        name=user_data.name
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered or database unavailable"
        )
    
    # Create JWT token
    access_token = create_access_token(data={"sub": user["_id"]})
    
    return TokenResponse(
        access_token=access_token,
        user={
            "id": user["_id"],
            "email": user["email"],
            "name": user["name"]
        }
    )

@app.post("/api/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, credentials: UserLogin):
    """Authenticate user and return JWT token"""
    user = await authenticate_user(
        email=credentials.email,
        password=credentials.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create JWT token
    access_token = create_access_token(data={"sub": user["_id"]})
    
    return TokenResponse(
        access_token=access_token,
        user={
            "id": user["_id"],
            "email": user["email"],
            "name": user["name"]
        }
    )

@app.get("/api/me")
async def get_current_user_info(user: dict = Depends(get_current_user)):
    """Get current authenticated user info"""
    return {
        "id": user["_id"],
        "email": user["email"],
        "name": user["name"],
        "profile": user.get("profile", {})
    }

@app.get("/api/user/stats")
async def get_user_statistics(user: dict = Depends(get_current_user)):
    """Get user analysis statistics"""
    stats = await get_user_stats(user["_id"])
    return stats

@app.get("/api/user/history")
async def get_analysis_history(
    limit: int = 50,
    skip: int = 0,
    user: dict = Depends(get_current_user)
):
    """Get user analysis history"""
    analyses = await get_user_analyses(user["_id"], limit=limit, skip=skip)
    return {"analyses": analyses}

# ============================================
# Gemini Proxy Endpoint (Secure Server-Side)
# ============================================

@app.post("/api/gemini-proxy")
@limiter.limit("20/minute")
async def gemini_proxy(
    request: Request,
    gemini_request: GeminiProxyRequest,
    user: dict = Depends(get_optional_user)
):
    """
    Secure proxy for Gemini API calls.
    The API key is kept server-side and never exposed to the client.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API is not configured on the server"
        )
    
    # Build the API URL with model
    model = gemini_request.model or "gemini-2.5-flash"
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    
    # Build request body
    payload = {"contents": gemini_request.contents}
    if gemini_request.generationConfig:
        payload["generationConfig"] = gemini_request.generationConfig
    if gemini_request.safetySettings:
        payload["safetySettings"] = gemini_request.safetySettings
    if gemini_request.systemInstruction:
        payload["systemInstruction"] = gemini_request.systemInstruction
    
    try:
        response = requests.post(
            f"{api_url}?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            # Don't expose internal API errors directly
            error_data = response.json() if response.headers.get("content-type", "").startswith("application/json") else {}
            raise HTTPException(
                status_code=response.status_code,
                detail=error_data.get("error", {}).get("message", "Gemini API request failed")
            )
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Gemini API request timed out"
        )
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to connect to Gemini API"
        )

@app.post("/api/gemini-proxy/analyze-image")
@limiter.limit("10/minute")
async def gemini_analyze_image(
    request: Request,
    analysis_request: GeminiImageAnalysisRequest,
    user: dict = Depends(get_optional_user)
):
    """
    Secure endpoint for Gemini-based image analysis.
    Handles image base64 data server-side for deepfake detection.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API is not configured on the server"
        )
    
    # Validate base64 size (prevent DoS)
    if len(analysis_request.image_base64) > 10_000_000:  # ~7.5MB actual
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image too large. Maximum size is approximately 7MB."
        )
    
    # Validate MIME type
    if analysis_request.mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type: {analysis_request.mime_type}"
        )
    
    try:
        # Decode base64 to validate it's a real image
        image_bytes = base64.b64decode(analysis_request.image_base64)
        
        # Use server-side Gemini analysis
        result = analyze_with_gemini(image_bytes, analysis_request.mime_type)
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image data"
        )

# ============================================
# Image Analysis Endpoints (Protected & Rate Limited)
# ============================================

@app.post("/analyze-image")
@limiter.limit("30/minute")
async def analyze_image(
    request: Request,
    file: UploadFile = File(...)
):
    """
    Analyze a single image for deepfake detection using local model.
    Includes input validation for file size and MIME type.
    """
    if not pipe:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Model is not loaded.")
    
    # SECURITY: Validate MIME type BEFORE reading file
    validated_mime = validate_mime_type(file.content_type, file.filename)
    
    # Read a small chunk first to check file size without loading entire file
    # This prevents memory exhaustion attacks
    first_chunk = await file.read(MAX_FILE_SIZE_BYTES + 1)
    if len(first_chunk) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE_BYTES // (1024*1024)}MB"
        )
    
    contents = first_chunk
    
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Inference via Pipeline
        results = pipe(image)
        
        fake_score = 0
        real_score = 0
        
        for r in results:
            label = r['label'].lower()
            score = r['score'] * 100
            
            if 'fake' in label:
                fake_score = score
            elif 'real' in label or 'true' in label:
                real_score = score
                
        is_fake = fake_score > real_score
        confidence = fake_score if is_fake else real_score
        
        # Metadata Forensics (EXIF)
        metadata_flags = []
        try:
            exif_data = image.getexif()
            if exif_data:
                for tag_id, value in exif_data.items():
                    tag = Image.ExifTags.TAGS.get(tag_id, tag_id)
                    if tag == 'Software':
                        if any(sw in str(value).lower() for sw in ['adobe', 'photoshop', 'gimp', 'editor', 'canvas', 'paint']):
                            metadata_flags.append(f"Editing software signature detected: {value}")
                    if tag == 'Make' and 'fake' in str(value).lower():
                        metadata_flags.append(f"Suspicious camera make: {value}")
        except Exception as exif_error:
            print(f"Metadata scan skipped: {exif_error}")

        return {
            "filename": file.filename,
            "is_fake": is_fake,
            "confidence": round(confidence, 2),
            "probabilities": {
                "real": round(real_score, 2),
                "fake": round(fake_score, 2)
            },
            "metadata_flags": metadata_flags,
            "device_used": "CPU (Transformers)"
        }

    except Exception as e:
        print(f"Error analyzing image: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to analyze image")


@app.post("/analyze-ensemble")
@limiter.limit("20/minute")
async def analyze_ensemble(
    request: Request,
    file: UploadFile = File(...),
    user: dict = Depends(get_optional_user)
):
    """
    Ensemble Analysis Endpoint with security hardening.
    Combines results from:
    1. Local HuggingFace ViT Model
    2. Gemini Vision API (server-side)
    
    Includes input validation for file size and MIME type.
    """
    # SECURITY: Validate MIME type BEFORE reading file
    validated_mime = validate_mime_type(file.content_type, file.filename)
    
    # SECURITY: Read with size limit to prevent DoS
    first_chunk = await file.read(MAX_FILE_SIZE_BYTES + 1)
    if len(first_chunk) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE_BYTES // (1024*1024)}MB"
        )
    
    contents = first_chunk
    
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Get local model result
        local_result = analyze_with_local_model(image)
        
        # Get Gemini result (server-side, API key protected)
        gemini_result = analyze_with_gemini(contents, validated_mime)
        
        # Calculate ensemble score
        local_fake_score = 0
        gemini_fake_score = 0
        models_used = []
        reasons = []
        
        # Process local result
        if local_result.get("probabilities"):
            local_fake_score = local_result["probabilities"].get("fake", 0)
            models_used.append("HuggingFace ViT")
        
        # Process Gemini result
        if gemini_result.get("confidence") is not None and gemini_result.get("status") != "error":
            if gemini_result.get("is_fake"):
                gemini_fake_score = gemini_result.get("confidence", 50)
            else:
                gemini_fake_score = 100 - gemini_result.get("confidence", 50)
            models_used.append("Gemini Vision")
            if gemini_result.get("reasons"):
                reasons.extend(gemini_result["reasons"])
        
        # Calculate weighted ensemble
        if len(models_used) == 2:
            ensemble_fake_score = (local_fake_score * 0.4) + (gemini_fake_score * 0.6)
        elif len(models_used) == 1:
            ensemble_fake_score = local_fake_score if "HuggingFace" in models_used[0] else gemini_fake_score
        else:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="No models available for analysis")
        
        ensemble_real_score = 100 - ensemble_fake_score
        is_fake = ensemble_fake_score > 50
        
        # Determine consensus
        local_says_fake = local_fake_score > 50 if local_result.get("probabilities") else None
        gemini_says_fake = gemini_result.get("is_fake") if gemini_result.get("status") != "error" else None
        
        consensus = "unknown"
        if local_says_fake is not None and gemini_says_fake is not None:
            if local_says_fake == gemini_says_fake:
                consensus = "agreement"
            else:
                consensus = "disagreement"
        
        result = {
            "filename": file.filename,
            "ensemble": {
                "is_fake": is_fake,
                "confidence": round(max(ensemble_fake_score, ensemble_real_score), 2),
                "fake_probability": round(ensemble_fake_score, 2),
                "real_probability": round(ensemble_real_score, 2),
                "consensus": consensus,
                "verdict": "LIKELY FAKE" if is_fake else "LIKELY AUTHENTIC"
            },
            "models": {
                "local": {
                    "available": bool(local_result.get("probabilities")),
                    "fake_probability": round(local_fake_score, 2) if local_result.get("probabilities") else None,
                    "real_probability": round(100 - local_fake_score, 2) if local_result.get("probabilities") else None
                },
                "gemini": {
                    "available": gemini_result.get("status") != "error",
                    "fake_probability": round(gemini_fake_score, 2) if gemini_result.get("status") != "error" else None,
                    "reasons": reasons[:5] if reasons else []
                }
            },
            "models_used": models_used,
            "analysis_type": "ensemble"
        }
        
        # Save analysis to history if user is authenticated
        if user:
            await save_analysis(user["_id"], {
                "type": "media",
                "contentPreview": file.filename,
                "result": result
            })
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Ensemble analysis error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to analyze image")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
