# DeFraudAI Unified Deployment Guide

This guide details how to deploy your **Full-Stack Application (React + FastAPI)** as a **Single Service on Railway**.

This unified approach eliminates CORS issues and simplifies management.

---

## Deployment Steps 🚀

### 1. Set up Railway Project
1. Go to [Railway Dashboard](https://railway.app/).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your repository: `deepfake_mini`.

### 2. Configure Variables (Crucial!)
Go to the **Variables** tab for your new service and add the following:

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | Connection string to your MongoDB Atlas |
| `JWT_SECRET_KEY` | `your-secret-key` | A long random string for auth security |
| `VITE_API_BASE_URL` | *(Leave Empty)* | **IMPORTANT:** Create request for this variable but leave the value **blank/empty**. This ensures the frontend uses relative paths (same domain). |
| `VITE_GEMINI_API_KEY` | `...` | (Optional) If you want to enable the cloud features |

*Note: For `VITE_API_BASE_URL`, if Railway requires a value, try a single space ` ` or just `/`. Ideally empty string allows the app to fetch `/api/...` directly.*

### 3. Verify Build Config
The project includes a `nixpacks.toml` file which automatically:
1. Installs Python 3.11 & Node.js 20.
2. Builds the React frontend (`npm run build`).
3. Installs Python backend dependencies.
4. Starts the FastAPI server (which serves the built React app).

### 4. Deploy
1. Railway should deploy automatically.
2. Once "Active", click the public URL.
3. Your React frontend should load instantly!
4. Upload an image -> Check Network tab -> It should hit `/analyze-image` (on the same domain).

---

## Troubleshooting

- **"API_BASE_URL is localhost"**: This means `VITE_API_BASE_URL` wasn't set to empty string properly. In Railway, ensure the variable exists and is empty, or set it to `/`.
- **"Module not found" / Build Fails**: Check `nixpacks.toml` logic. Ensure `package-lock.json` or `pnpm-lock.yaml` isn't conflicting.
- **Frontend shows White Screen**: Open Console (F12). If script errors, check paths.
- **Backend 404s**: Ensure `dist` folder was created. The build logs should say `npm run build` executed.

**Enjoy your unified DeFraudAI platform!** 🛡️
