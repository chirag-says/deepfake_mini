# DeFraudAI Browser Extension

A Chrome extension for instant deepfake detection using **Ensemble AI Analysis** (Local Model + Gemini Vision API).

## 🌟 Features

- **Ensemble Analysis**: Combines two AI models for maximum accuracy
  - 🤖 **Local HuggingFace ViT** - Fast, offline-capable detection
  - ✨ **Gemini Vision API** - Nuanced analysis with reasoning
- **Right-Click Detection**: Analyze any image on any website
- **Consensus Indicator**: Shows if both models agree
- **Detailed Breakdown**: See individual model scores and AI-generated reasons

## 📦 Installation

### Step 1: Load the Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `browser-extension` folder from this project

### Step 2: Start the Backend Server
```bash
cd deepfake_mini
python src/backend/main.py
```

### Step 3: Configure Gemini API (Recommended)
For best accuracy, set your Gemini API key as an environment variable:

**Windows (PowerShell):**
```powershell
$env:VITE_GEMINI_API_KEY = "your-api-key-here"
python src/backend/main.py
```

**Linux/Mac:**
```bash
export VITE_GEMINI_API_KEY="your-api-key-here"
python src/backend/main.py
```

Without Gemini, the extension will still work using only the local model.

## 🎯 Usage

1. Navigate to any webpage with images
2. Right-click on an image
3. Select **"🔍 Check with DeFraudAI (Ensemble AI)"**
4. View the comprehensive analysis in the overlay:
   - **Verdict**: LIKELY FAKE or AUTHENTIC
   - **Ensemble Confidence**: Combined score from both models
   - **Consensus**: Whether both models agree
   - **Model Breakdown**: Individual scores from each AI
   - **AI Reasons**: Detailed explanations (if Gemini is enabled)

## 📊 How Ensemble Scoring Works

When both models are available:
- Local ViT contributes **40%** of the final score
- Gemini Vision contributes **60%** of the final score

This weighting gives priority to Gemini's more nuanced analysis while still benefiting from the local model's specialized deepfake training.

## 🔧 Technical Details

- **Manifest Version**: V3 (latest Chrome extension format)
- **Backend**: FastAPI (Python)
- **Local Model**: `dima806/deepfake_vs_real_image_detection` (ViT-base)
- **Cloud Model**: Gemini 1.5 Flash (Vision)
- **Endpoint**: `http://localhost:8000/analyze-ensemble`

## ⚠️ Troubleshooting

**"Backend Offline" Error:**
- Make sure `python src/backend/main.py` is running
- Check if port 8000 is available

**Gemini shows "Not configured":**
- Set the `VITE_GEMINI_API_KEY` environment variable before starting the server
- Restart the backend after setting the key

**Models disagree frequently:**
- This is normal! Different models have different strengths
- Consider the image carefully when consensus = "disagreement"
