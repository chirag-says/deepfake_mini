from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODEL DEFINITION (Hugging Face Transformers) ---
# Using a pre-trained Video/Image Transformer fine-tuned for Deepfake Detection
from transformers import pipeline

# Load a reliable pre-trained model from Hugging Face
# Model: dima806/deepfake_vs_real_image_detection (ViT-base patch16 224)
# This model will automatically download on first run (~300MB)
print("Loading Deepfake Detection Model... (this may take a moment)")
try:
    pipe = pipeline("image-classification", model="dima806/deepfake_vs_real_image_detection")
    print("Model loaded successfully!")
except Exception as e:
    print(f"Failed to load model: {e}")
    pipe = None

# Gemini API Configuration
GEMINI_API_KEY = os.environ.get("VITE_GEMINI_API_KEY", "")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

def analyze_with_gemini(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """Analyze image using Gemini Vision API"""
    if not GEMINI_API_KEY:
        return {"status": "error", "message": "Gemini API key not configured"}
    
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
            # Extract JSON from response
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

@app.get("/")
def read_root():
    status = "Deepfake Detection API is running" if pipe else "Model failed to load"
    return {
        "status": status, 
        "model": "dima806/deepfake_vs_real_image_detection",
        "gemini_configured": bool(GEMINI_API_KEY)
    }

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    if not pipe:
        raise HTTPException(status_code=500, detail="Model is not loaded.")
        
    try:
        # 1. Read Image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # 2. Inference via Pipeline
        # The pipeline handles preprocessing (resize/normalize) internally for ViT
        results = pipe(image)
        # results example: [{'label': 'real', 'score': 0.99}, {'label': 'fake', 'score': 0.01}]
        
        # 3. Parse Results
        fake_score = 0
        real_score = 0
        
        for r in results:
            label = r['label'].lower()
            score = r['score'] * 100
            
            if 'fake' in label:
                fake_score = score
            elif 'real' in label or 'true' in label:
                real_score = score
                
        # Handle cases where only one label is returned (rare in binary, but possible)
        is_fake = fake_score > real_score
        confidence = fake_score if is_fake else real_score
        
        # 4. Metadata Forensics (EXIF)
        metadata_flags = []
        try:
            exif_data = image.getexif()
            if exif_data:
                for tag_id, value in exif_data.items():
                    tag = Image.ExifTags.TAGS.get(tag_id, tag_id)
                    # Check for editing software signatures
                    if tag == 'Software':
                        if any(sw in str(value).lower() for sw in ['adobe', 'photoshop', 'gimp', 'editor', 'canvas', 'paint']):
                            metadata_flags.append(f"Editing software signature detected: {value}")
                    # Check for non-standard implementations
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
            "device_used": "CPU (Transformers)" # Transformers pipeline defaults to CPU unless device=0 specified
        }

    except Exception as e:
        print(f"Error analyzing image: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze-ensemble")
async def analyze_ensemble(file: UploadFile = File(...)):
    """
    Ensemble Analysis Endpoint
    Combines results from:
    1. Local HuggingFace ViT Model
    2. Gemini Vision API
    
    Returns weighted average with confidence levels from both models.
    """
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Get local model result
        local_result = analyze_with_local_model(image)
        
        # Get Gemini result
        gemini_result = analyze_with_gemini(contents, file.content_type or "image/jpeg")
        
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
        
        # Calculate weighted ensemble (both models weighted equally if both available)
        if len(models_used) == 2:
            # Both models available - use weighted average
            # Give slightly more weight to Gemini for nuanced analysis
            ensemble_fake_score = (local_fake_score * 0.4) + (gemini_fake_score * 0.6)
        elif len(models_used) == 1:
            # Only one model available
            ensemble_fake_score = local_fake_score if "HuggingFace" in models_used[0] else gemini_fake_score
        else:
            raise HTTPException(status_code=500, detail="No models available for analysis")
        
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
        
        return {
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
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Ensemble analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
