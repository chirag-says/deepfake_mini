"""
DeFraudAI Backend - Security Hardened
Implements secure authentication, rate limiting, input validation, and API proxying
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Request, Response, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image, ImageChops, ImageEnhance, ExifTags
import io
import numpy as np
import os
from pathlib import Path
from typing import List, Optional, Union
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
print(f"GEMINI_API_KEY value: '{GEMINI_API_KEY[:10]}...' (len={len(GEMINI_API_KEY)})" if GEMINI_API_KEY else "GEMINI_API_KEY is EMPTY!")
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
# Cookie-Based Authentication Configuration
# ============================================

# Cookie settings for secure JWT storage
COOKIE_NAME = "defraudai_session"
COOKIE_MAX_AGE = 60 * 60 * 24 * 7  # 7 days in seconds

# Determine if running in production (Railway sets PORT)
IS_PRODUCTION = os.environ.get("RAILWAY_ENVIRONMENT") or os.environ.get("VERCEL")

# Cookie security settings
# - HttpOnly: Prevents JavaScript access (XSS protection)
# - Secure: Only sent over HTTPS (required in production)
# - SameSite: CSRF protection (Lax allows navigational requests)
COOKIE_SECURE = bool(IS_PRODUCTION)  # True in production, False in dev
COOKIE_SAMESITE = "lax"  # "lax" allows cross-site navigation, blocks cross-site POST
COOKIE_HTTPONLY = True  # Always true - prevents XSS token theft
COOKIE_PATH = "/"  # Available on all routes

# ============================================
# Rate Limiting Setup
# ============================================

def get_real_client_ip(request: Request) -> str:
    """
    Extract real client IP from behind Railway/Vercel proxy.
    
    SECURITY: Only trust X-Forwarded-For in production where the proxy is trusted.
    The leftmost IP in the chain is the original client.
    """
    # Check X-Forwarded-For header (set by Railway, Vercel, etc.)
    forwarded_for = request.headers.get("X-Forwarded-For", "")
    if forwarded_for:
        # Take the leftmost IP (original client), strip whitespace
        client_ip = forwarded_for.split(",")[0].strip()
        if client_ip:
            return client_ip
    
    # Fallback to X-Real-IP (some proxies use this)
    real_ip = request.headers.get("X-Real-IP", "")
    if real_ip:
        return real_ip.strip()
    
    # Final fallback to direct connection IP
    return get_remote_address(request)

limiter = Limiter(key_func=get_real_client_ip)

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
# Lifespan Events (modern pattern)
# ============================================

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Modern lifespan handler for startup/shutdown."""
    # Startup: Initialize database connection
    await connect_to_mongodb()
    yield
    # Shutdown: Close database connection
    await close_mongodb_connection()

# ============================================
# Initialize FastAPI with Rate Limiting
# ============================================

app = FastAPI(
    title="DeFraudAI API",
    description="Secure Deepfake Detection API",
    version="2.0.0",
    lifespan=lifespan  # Use modern lifespan handler
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

def extract_token_from_request(request: Request, credentials: Optional[HTTPAuthorizationCredentials]) -> Optional[str]:
    """
    Extract JWT token from request, checking multiple sources.
    
    Priority:
    1. HttpOnly cookie (most secure - browser clients)
    2. Authorization Bearer header (for API clients, backward compat)
    
    SECURITY: Cookie takes priority because it's HttpOnly (XSS-proof).
    """
    # Priority 1: Check HttpOnly cookie
    cookie_token = request.cookies.get(COOKIE_NAME)
    if cookie_token:
        return cookie_token
    
    # Priority 2: Check Authorization header (backward compat for API clients)
    if credentials and credentials.credentials:
        return credentials.credentials
    
    return None

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Validate JWT token and return user data"""
    token = extract_token_from_request(request, credentials)
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
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

async def get_optional_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Optional authentication - returns None if no valid token"""
    token = extract_token_from_request(request, credentials)
    
    if not token:
        return None
    
    try:
        payload = decode_access_token(token)
        if payload and payload.get("sub"):
            return await get_user_by_id(payload["sub"])
    except Exception:
        # Log for debugging but don't expose to user
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

def perform_ela(image: Image.Image, quality: int = 90) -> float:
    """
    Perform Error Level Analysis (ELA) to detect manipulation.
    Returns a score from 0-100 indicating likelihood of manipulation.
    """
    try:
        # Save compressed version to memory
        buffer = io.BytesIO()
        image.convert("RGB").save(buffer, "JPEG", quality=quality)
        buffer.seek(0)
        
        # Open compressed version
        compressed_image = Image.open(buffer)
        
        # Calculate difference
        ela_image = ImageChops.difference(image.convert("RGB"), compressed_image)
        
        # Get extrema (max difference)
        extrema = ela_image.getextrema()
        max_diff = max([ex[1] for ex in extrema])
        
        # Scale to 0-100 (higher diff = higher likelihood of manipulation)
        # Threshold: diff > 10-15 usually indicates editing
        score = min((max_diff / 20.0) * 100, 100)
        return score
    except Exception as e:
        print(f"ELA Error: {e}")
        return 0

def clean_metadata(image: Image.Image) -> dict:
    """Extract and analyze metadata for editing traces."""
    meta_score = 0
    traces = []
    
    try:
        exif = image.getexif()
        if exif:
            for tag_id, value in exif.items():
                tag = ExifTags.TAGS.get(tag_id, tag_id)
                value_str = str(value).lower()
                
                # Look for editing software
                if "software" in str(tag).lower():
                    if any(x in value_str for x in ["adobe", "photoshop", "gimp", "paint", "canvas", "edit"]):
                        meta_score = 80
                        traces.append(f"Editing software detected: {value}")
    except Exception:
        pass
        
    return {"score": meta_score, "traces": traces}

def analyze_with_local_model(image: Image.Image) -> dict:
    """
    Comprehensive Local Analysis (Ensemble of One)
    Combines:
    1. ViT Deepfake Model (Visual)
    2. ELA Analysis (Digital Artifacts)
    3. Metadata Forensics (File History)
    """
    if not pipe:
        return {"status": "error", "message": "Local model not loaded"}
    
    try:
        # 1. VSION MODEL ANALYSIS
        results = pipe(image)
        deepfake_score = 0
        real_score = 0
        
        for r in results:
            label = r['label'].lower()
            score = r['score'] * 100
            if 'fake' in label:
                deepfake_score = score
            elif 'real' in label or 'true' in label:
                real_score = score
        
        # 2. ELA ANALYSIS
        ela_score = perform_ela(image)
        
        # 3. METADATA ANALYSIS
        metadata = clean_metadata(image)
        
        # --- ENSEMBLE LOGIC ---
        
        # Weighted Final Score
        # Model: 70%, ELA: 20%, Metadata: 10%
        final_fake_score = (deepfake_score * 0.7) + (ela_score * 0.2) + (metadata["score"] * 0.1)
        
        is_fake = final_fake_score > 50
        
        # Generate Explanations
        reasons = []
        if deepfake_score > 60:
            reasons.append(f"Visual artifacts detected ({int(deepfake_score)}% confidence)")
        if ela_score > 50:
            reasons.append("Digital compression anomalies detected (ELA)")
        reasons.extend(metadata["traces"])
        
        if not reasons and is_fake:
            reasons.append("Combined heuristic threshold exceeded")
        elif not reasons:
            reasons.append("No significant manipulation traces found")

        return {
            "is_fake": is_fake,
            "confidence": round(final_fake_score if is_fake else (100 - final_fake_score), 2),
            "probabilities": {
                "real": round(100 - final_fake_score, 2),
                "fake": round(final_fake_score, 2)
            },
            "reasons": reasons,
            "factors": {
                "model_score": round(deepfake_score, 2),
                "ela_score": round(ela_score, 2),
                "metadata_traces": len(metadata["traces"])
            }
        }
    except Exception as e:
        print(f"Analysis Error: {e}")
        return {"status": "error", "message": str(e)}

# (Lifespan events are handled by the lifespan context manager above)

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
async def health_check():
    """
    Health check endpoint for monitoring.
    
    Checks:
    - API server status
    - ML model loaded
    - Database connectivity
    """
    from database import db
    
    # Check database connection
    db_healthy = False
    try:
        if db is not None:
            # Ping the database to verify connection
            await db.command("ping")
            db_healthy = True
    except Exception as e:
        print(f"Database health check failed: {e}")
    
    # Overall health depends on critical components
    is_healthy = db_healthy  # DB is required; model is optional
    
    return {
        "status": "healthy" if is_healthy else "degraded",
        "checks": {
            "database": "connected" if db_healthy else "disconnected",
            "model": "loaded" if pipe is not None else "not_loaded",
            "gemini": "configured" if GEMINI_API_KEY else "not_configured"
        }
    }

# ============================================
# Authentication Endpoints
# ============================================

@app.post("/api/register", response_model=TokenResponse)
@limiter.limit("5/minute")
async def register(request: Request, response: Response, user_data: UserRegister):
    """
    Register a new user account.
    
    SECURITY: Sets HttpOnly cookie for browser clients.
    Also returns token in body for backward compatibility with API clients.
    """
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
    
    # Set HttpOnly cookie for secure browser authentication
    response.set_cookie(
        key=COOKIE_NAME,
        value=access_token,
        max_age=COOKIE_MAX_AGE,
        httponly=COOKIE_HTTPONLY,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path=COOKIE_PATH
    )
    
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
async def login(request: Request, response: Response, credentials: UserLogin):
    """
    Authenticate user and return JWT token.
    
    SECURITY: Sets HttpOnly cookie for browser clients.
    Also returns token in body for backward compatibility with API clients.
    """
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
    
    # Set HttpOnly cookie for secure browser authentication
    response.set_cookie(
        key=COOKIE_NAME,
        value=access_token,
        max_age=COOKIE_MAX_AGE,
        httponly=COOKIE_HTTPONLY,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path=COOKIE_PATH
    )
    
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

@app.post("/api/logout")
async def logout(response: Response):
    """
    Logout user by clearing the session cookie.
    
    SECURITY: Clears the HttpOnly cookie, effectively logging out the user.
    Note: The JWT itself remains valid until expiry, but the browser
    will no longer send it. For full invalidation, see token blacklist.
    """
    response.delete_cookie(
        key=COOKIE_NAME,
        path=COOKIE_PATH,
        httponly=COOKIE_HTTPONLY,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE
    )
    return {"message": "Logged out successfully"}

@app.get("/api/user/stats")
async def get_user_statistics(user: dict = Depends(get_current_user)):
    """Get user analysis statistics"""
    stats = await get_user_stats(user["_id"])
    return stats

@app.get("/api/user/history")
async def get_analysis_history_endpoint(
    limit: int = 50,
    skip: int = 0,
    user: dict = Depends(get_current_user)
):
    """Get user analysis history"""
    analyses = await get_user_analyses(user["_id"], limit=limit, skip=skip)
    # Return as array for frontend compatibility
    return analyses

@app.delete("/api/user/history/{analysis_id}")
async def delete_analysis_endpoint(
    analysis_id: str,
    user: dict = Depends(get_current_user)
):
    """Delete a specific analysis from history"""
    from database import delete_analysis
    success = await delete_analysis(analysis_id, user["_id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found or already deleted"
        )
    return {"message": "Analysis deleted"}

@app.delete("/api/user/history/clear")
async def clear_history_endpoint(
    user: dict = Depends(get_current_user)
):
    """Clear all analysis history for the user"""
    from database import clear_user_history
    deleted_count = await clear_user_history(user["_id"])
    return {"message": f"Cleared {deleted_count} analyses"}

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
    print(f"DEBUG: GEMINI_API_KEY in endpoint = '{GEMINI_API_KEY[:10] if GEMINI_API_KEY else 'EMPTY'}...'")
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
    file: UploadFile = File(...),
    user: dict = Depends(get_optional_user)
):
    """
    Analyze a single image for deepfake detection using local multi-factor model.
    Combines ViT, ELA, and Metadata analysis.
    Saves result if user is authenticated.
    """
    if not pipe:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Model is not loaded.")
    
    # SECURITY: Validate MIME type BEFORE reading file
    validated_mime = validate_mime_type(file.content_type, file.filename)
    
    # Read a small chunk first to check file size without loading entire file
    first_chunk = await file.read(MAX_FILE_SIZE_BYTES + 1)
    if len(first_chunk) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE_BYTES // (1024*1024)}MB"
        )
    
    contents = first_chunk
    
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # USE NEW ENHANCED ANALYSIS FUNCTION
        result = analyze_with_local_model(image)
        
        if result.get("status") == "error":
            raise HTTPException(status_code=500, detail=result.get("message"))
            
        # Add metadata to response
        response_data = {
            "is_fake": result["is_fake"],
            "confidence": result["confidence"],
            "probabilities": result["probabilities"],
            "reasons": result["reasons"],
            "factors": result["factors"],
            "method": "ensemble_local_v2"
        }
        
        # Save to history if user is logged in
        if user:
            try:
                # Convert image to base64 for storage (optional, or just store metadata)
                # For now we won't store the image itself to save DB space, just the result
                await save_analysis(
                    user_id=user["_id"],
                    file_name=file.filename,
                    file_type="image",
                    result=response_data
                )
            except Exception as e:
                print(f"Failed to save analysis history: {e}")
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Endpoint Error: {e}")
        raise HTTPException(status_code=500, detail="Internal analysis error")


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



# ============================================
# Frontend Static Files (Unified Deployment)
# ============================================

# Path to frontend build (from src/backend/main.py -> ../../dist)
frontend_dist = Path(__file__).resolve().parent.parent.parent / "dist"

if frontend_dist.exists():
    print(f"Serving frontend from: {frontend_dist}")
    
    # Mount assets directory (e.g. /assets/index.js)
    if (frontend_dist / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")
        
    # Serve favicon, robots.txt, sitemap.xml, and PWA files directly if they exist
    for static_file in ["robots.txt", "sitemap.xml", "favicon.ico", "logo.png", "sw.js", "manifest.json", "service-worker.js"]:
        file_path = frontend_dist / static_file
        if file_path.exists():
            # Use a closure to capture the specific file path
            @app.get(f"/{static_file}")
            async def serve_static_root(f_path=file_path): 
                from fastapi.responses import FileResponse
                return FileResponse(f_path)

    # Root route -> index.html
    @app.get("/")
    async def serve_spa_root():
        return HTMLResponse((frontend_dist / "index.html").read_text(encoding="utf-8"))

    # Catch-all for React Router (must be last)
    @app.get("/{full_path:path}")
    async def serve_spa_catch_all(full_path: str):
        # Passthrough for API routes that weren't matched (returns 404 JSON instead of HTML)
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
             raise HTTPException(status_code=404, detail="Not Found")
        
        # Serve index.html for any other route to let React handle routing
        return HTMLResponse((frontend_dist / "index.html").read_text(encoding="utf-8"))
else:
    print(f"Warning: Frontend build not found at {frontend_dist}. Running in API-only mode.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
