# DeFraudAI: Local Deepfake Model Setup Guide

To enable the "Offline/Local" detection model, you must install the necessary Windows C++ drivers (`c10.dll` error fix).

## 1. Fix "Missing DLL" Error
1. Download the **Microsoft Visual C++ Redistributable (x64)**:
   - **Direct Link:** [https://aka.ms/vs/17/release/vc_redist.x64.exe](https://aka.ms/vs/17/release/vc_redist.x64.exe)
2. Run the installer.
3. **RESTART YOUR COMPUTER**. This is required.

## 2. Start the Backend Server
After verifying step 1:

1. Open a terminal in this project.
2. Navigate to the backend folder:
   ```powershell
   cd src/backend
   ```
3. Run the server:
   ```powershell
   python main.py
   ```
   *Alternative:* `uvicorn main:app --reload`

## 3. Verify
1. Go to `http://localhost:8000/`. You should see `{"status": "Deepfake Detection API is running"}`.
2. Open the **DeFraudAI Website**.
3. Go to **Media Authenticity** and upload an image.
4. The "Local Model Analysis" card will now show real-time probabilities.

## 4. Features Enabled
- **Ensemble Check**: When both Cloud (Gemini) and Local (EfficientNet) models are active, a combined "Ensemble Consensus" score is displayed for higher reliability.
- **Offline Fallback**: If the Cloud API fails, the text verification system gracefully falls back to local heuristic analysis.
