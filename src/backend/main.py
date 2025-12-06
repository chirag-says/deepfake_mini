from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
import numpy as np

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

# --- MODEL DEFINITION (EfficientNet-B4) ---
# We use a pre-trained EfficientNet and modify the final layer for binary classification (Real vs Fake)
class DeepfakeDetector(nn.Module):
    def __init__(self):
        super(DeepfakeDetector, self).__init__()
        # Load EfficientNet B4 with default weights
        self.model = models.efficientnet_b4(weights=models.EfficientNet_B4_Weights.DEFAULT)
        # Modified classifier for 2 classes: [Real, Fake]
        self.model.classifier[1] = nn.Linear(self.model.classifier[1].in_features, 2)

    def forward(self, x):
        return self.model(x)

# Load Model (Lazy loading to avoid startup crash if weights aren't present yet)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = DeepfakeDetector().to(device)
model.eval()

# Image Preprocessing
transform = transforms.Compose([
    transforms.Resize((380, 380)), # EfficientNet B4 input size
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

@app.get("/")
def read_root():
    return {"status": "Deepfake Detection API is running", "device": str(device)}

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    try:
        # 1. Read Image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # 2. Preprocess
        img_tensor = transform(image).unsqueeze(0).to(device)
        
        # 3. Inference
        with torch.no_grad():
            outputs = model(img_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            
        # 4. Result Parsing
        # Assuming Class 0 = Real, Class 1 = Fake (Common convention, but needs verification with specific weights)
        fake_prob = probabilities[0][1].item() * 100
        real_prob = probabilities[0][0].item() * 100
        
        is_fake = fake_prob > 50
        confidence = fake_prob if is_fake else real_prob
        
        return {
            "filename": file.filename,
            "is_fake": is_fake,
            "confidence": round(confidence, 2),
            "probabilities": {
                "real": round(real_prob, 2),
                "fake": round(fake_prob, 2)
            },
            "device_used": str(device)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
