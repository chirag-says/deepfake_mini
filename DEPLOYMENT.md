# 🚀 DeFraudAI Deployment Guide

## Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  Vercel         │ ──────▶ │  Railway        │ ──────▶ │  MongoDB Atlas  │
│  (Frontend)     │  HTTPS  │  (Backend API)  │         │  (Database)     │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
     React/Vite              FastAPI + ML Model          User Data
```

---

## Prerequisites

- [x] GitHub account
- [x] Vercel account (https://vercel.com - free tier works)
- [x] Railway account (https://railway.app - $5/month or free trial)
- [x] MongoDB Atlas account (https://mongodb.com/atlas - free tier works)
- [x] Your Gemini API key

---

## Part 1: MongoDB Atlas Setup (5 minutes)

### Step 1.1: Create a Free Cluster

1. Go to [MongoDB Atlas](https://mongodb.com/atlas) and sign in
2. Click **"Build a Database"**
3. Choose **"M0 FREE"** tier
4. Select a region close to your users
5. Click **"Create Cluster"**

### Step 1.2: Create Database User

1. Go to **Database Access** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter a username (e.g., `defraudai_user`)
5. Generate a secure password and **save it**
6. Set privileges to **"Read and write to any database"**
7. Click **"Add User"**

### Step 1.3: Configure Network Access

1. Go to **Network Access** in the left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Required for Railway which uses dynamic IPs
4. Click **"Confirm"**

### Step 1.4: Get Connection String

1. Go to **Database** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string, it looks like:
   ```
   mongodb+srv://defraudai_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. **Save this string** for later

---

## Part 2: Railway Backend Deployment (10 minutes)

### Step 2.1: Push Backend to GitHub

First, ensure your backend code is in a GitHub repository. If not already:

```bash
cd d:\InProgress\DeFraudAI\deepfake_mini
git add .
git commit -m "Add deployment configuration"
git push origin main
```

### Step 2.2: Create Railway Project

1. Go to [Railway](https://railway.app) and sign in with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Find and select your `deepfake_mini` repository
5. **Important**: Click the ⚙️ settings icon before deploying

### Step 2.3: Configure Build Settings

In the Railway service settings:

1. **Root Directory**: Set to `src/backend`
2. **Build Command**: `pip install -r requirements.txt`
3. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 2.4: Add Environment Variables

In Railway, go to **Variables** tab and add:

| Variable | Value |
|----------|-------|
| `JWT_SECRET_KEY` | `8cae730d7bb6f35c05e0b6c779936c5ef630c5e7809b51c6585297421181903d` |
| `VITE_GEMINI_API_KEY` | Your Gemini API key |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | `defraudai` |
| `FRONTEND_URL` | `https://your-app.vercel.app` (update after Vercel deploy) |
| `PYTHON_VERSION` | `3.11` |

### Step 2.5: Deploy

1. Click **"Deploy"**
2. Wait for the build (5-10 minutes first time due to ML model download)
3. Once deployed, click **"Settings"** → **"Networking"** → **"Generate Domain"**
4. You'll get a URL like: `https://defraudai-api-production.up.railway.app`
5. **Save this URL** - this is your `VITE_API_BASE_URL`

### Step 2.6: Verify Backend

Open your Railway backend URL in a browser:
```
https://your-railway-app.up.railway.app/
```

You should see:
```json
{
  "status": "Deepfake Detection API is running",
  "model": "dima806/deepfake_vs_real_image_detection",
  "gemini_configured": true,
  "version": "2.0.0-secure"
}
```

---

## Part 3: Vercel Frontend Deployment (5 minutes)

### Step 3.1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 3.2: Deploy via Vercel Dashboard

1. Go to [Vercel](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your `deepfake_mini` repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (leave as project root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3.3: Add Environment Variables

In Vercel project settings → **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://your-railway-app.up.railway.app` |
| `VITE_GEMINI_MODEL_NAME` | `gemini-2.5-flash` |

> ⚠️ **Note**: Do NOT add `VITE_GEMINI_API_KEY` to Vercel! The API key is now only used server-side on Railway.

### Step 3.4: Deploy

1. Click **"Deploy"**
2. Wait for the build (2-3 minutes)
3. Your site will be live at: `https://your-project.vercel.app`

---

## Part 4: Final Configuration

### Step 4.1: Update Railway CORS

Now that you have your Vercel URL, update Railway:

1. Go to Railway → your project → **Variables**
2. Update `FRONTEND_URL` to your Vercel URL:
   ```
   https://your-project.vercel.app
   ```
3. Railway will automatically redeploy

### Step 4.2: Custom Domain (Optional)

**Vercel:**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

**Railway:**
1. Go to Service Settings → Networking
2. Add custom domain
3. Configure DNS CNAME record

---

## Part 5: Troubleshooting

### Issue: "Model failed to load" on Railway

The ML model requires significant memory. In Railway:
1. Go to Settings → Resources
2. Increase memory to at least 2GB (may require paid plan)

### Issue: CORS Errors

1. Verify `FRONTEND_URL` in Railway matches your Vercel URL exactly
2. Check for trailing slashes (remove them)
3. Redeploy Railway after changing variables

### Issue: 401 Unauthorized

1. Ensure `JWT_SECRET_KEY` is set in Railway
2. Check that the frontend is using the correct `VITE_API_BASE_URL`

### Issue: Gemini API Errors

1. Verify `VITE_GEMINI_API_KEY` is set in Railway (not Vercel)
2. Check the API key is valid at [Google AI Studio](https://aistudio.google.com)

### Issue: Database Connection Failed

1. Verify MongoDB Atlas Network Access allows `0.0.0.0/0`
2. Check the connection string password is correct
3. Ensure the database user has read/write permissions

---

## Environment Variables Summary

### Railway (Backend)
```env
JWT_SECRET_KEY=your-256-bit-secret-key
VITE_GEMINI_API_KEY=your-gemini-api-key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net
MONGODB_DB_NAME=defraudai
FRONTEND_URL=https://your-app.vercel.app
PYTHON_VERSION=3.11
```

### Vercel (Frontend)
```env
VITE_API_BASE_URL=https://your-railway-app.up.railway.app
VITE_GEMINI_MODEL_NAME=gemini-2.5-flash
```

---

## 🎉 Done!

Your DeFraudAI application is now deployed with:
- ✅ Secure JWT authentication
- ✅ API key protected on server-side
- ✅ Rate limiting enabled
- ✅ CORS properly configured
- ✅ Input validation active

**Live URLs:**
- Frontend: `https://your-project.vercel.app`
- Backend API: `https://your-railway-app.up.railway.app`
