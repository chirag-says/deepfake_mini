# DeFraudAI Deployment Guide

This guide walks you through deploying the **Backend to Railway** and the **Frontend to Vercel**.

---

## Part 1: Deploy Backend to Railway 🚂

Railway is excellent for Python/FastAPI hosting.

### 1. Set up Railway Project
1. Go to [Railway Dashboard](https://railway.app/).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your repository: `deepfake_mini`.
4. **IMPORTANT**: Do not deploy immediately! Click **Add Variables** or go to Settings first if possible. If it starts building, cancel it or let it fail (it might fail because it's in a subdirectory).

### 2. Configure Service Settings
1. Click on the card for your service (repo name).
2. Go to the **Settings** tab.
3. Scroll down to **Root Directory**.
4. Change it from `/` to `/src/backend`.
   - *This tells Railway to look for `requirements.txt` and `main.py` in the backend folder.*
5. Save settings.

### 3. Set Environment Variables
Go to the **Variables** tab and add the following keys:

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | Connection string to your MongoDB Atlas |
| `JWT_SECRET_KEY` | `your-secret-key` | A long random string for auth security |
| `FRONTEND_URL` | `https://your-project.vercel.app` | **Add this LATER** after Vercel deploy, or put `*` temporarily. |
| `VITE_GEMINI_API_KEY` | `...` | (Optional) If you want to enable the cloud features |

### 4. Deploy
1. Railway should automatically detect the changes and rebuild (or click **Republish**).
2. Watch the **Deployments** logs. It should install packages from `src/backend/requirements.txt`.
3. Once valid, Railway will generate a public URL (e.g., `https://deepfake-backend-production.up.railway.app`).
4. **Copy this URL**. You need it for the frontend.

---

## Part 2: Deploy Frontend to Vercel ▲

Vercel is optimized for Vite/React applications.

### 1. Set up Vercel Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** → **Project**.
3. Import your `deepfake_mini` repository.

### 2. Configure Build Settings
Vercel should auto-detect "Vite".
- **Framework Preset**: Vite
- **Root Directory**: `./` (Default is fine)
- **Build Command**: `vite build` (Default)
- **Output Directory**: `dist` (Default)

### 3. Set Environment Variables
Expand the **Environment Variables** section and add:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | `https://your-backend.railway.app` | The backend URL from Part 1 |

*Note: Do NOT add a trailing slash (e.g., use `.../app`, not `.../app/`).*

### 4. Deploy
1. Click **Deploy**.
2. Vercel will build the React app.
3. Once done, you will get a dashboard URL (e.g., `https://defraudai.vercel.app`).

---

## Part 3: Verify & Connect 🔗

### 1. Update Backend CORS
1. Go back to **Railway**.
2. Update the `FRONTEND_URL` variable to your actual Vercel URL (e.g., `https://defraudai.vercel.app`).
3. Railway will restart the server.

### 2. Test the App
1. Open your Vercel URL.
2. Go to **Media Authenticity** page.
3. Upload an Image.
4. It should show:
   - "Deepfake & Media Forensics"
   - "Local Model Analysis (Hugging Face ViT)"
   - Result: "REAL" or "FAKE DETECTED"
5. Open the Network tab (F12) to verify it calls `https://your-backend.railway.app/analyze-image`.

---

## Troubleshooting

- **Backend 503/500**: Check Railway logs. Ensure `Procfile` command `uvicorn main:app` is running successfully.
- **Frontend "Network Error"**:
  - Check `VITE_API_BASE_URL` in Vercel.
  - Check CORS (`FRONTEND_URL`) in Railway.
  - Ensure backend is strictly using https.
- **"Module not found"**: Ensure `Root Directory` in Railway is `/src/backend`.

**Enjoy your secure, private Deepfake Detection app!** 🛡️
