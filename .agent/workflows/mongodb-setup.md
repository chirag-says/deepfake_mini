---
description: How to add MongoDB for persistent analysis history storage
---

# Adding MongoDB to DeFraudAI

This guide walks you through adding MongoDB to store analysis history persistently.

## Prerequisites

- MongoDB Atlas account (free tier) OR local MongoDB installation
- Python 3.8+
- Node.js 18+

---

## Step 1: Set Up MongoDB Atlas (Recommended)

### 1.1 Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project called "DeFraudAI"

### 1.2 Create a Cluster
1. Click "Build a Database"
2. Select **FREE** tier (M0 Sandbox)
3. Choose a cloud provider (AWS recommended) and region close to you
4. Name your cluster "defraudai-cluster"
5. Click "Create Cluster" (takes 1-3 minutes)

### 1.3 Set Up Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create a user:
   - Username: `defraudai_user`
   - Password: Generate a secure password (save it!)
   - Role: "Read and write to any database"
4. Click "Add User"

### 1.4 Set Up Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production, add only your server's IP

### 1.5 Get Connection String
1. Go to "Database" → Click "Connect" on your cluster
2. Select "Connect your application"
3. Choose "Python" and version "3.12 or later"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://defraudai_user:<password>@defraudai-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password

---

## Step 2: Install Python Dependencies

// turbo
```bash
pip install pymongo python-dotenv motor
```

This installs:
- `pymongo` - MongoDB driver for Python
- `motor` - Async MongoDB driver (for FastAPI)
- `python-dotenv` - Environment variable management

---

## Step 3: Update Environment Variables

Add to your `.env` file:

```env
MONGODB_URI=mongodb+srv://defraudai_user:YOUR_PASSWORD@defraudai-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=defraudai
```

---

## Step 4: Create Database Module

Create file: `src/backend/database.py`

```python
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime
from bson import ObjectId
from typing import Optional, List, Dict, Any

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "defraudai")

# MongoDB client (initialized on first use)
client: Optional[AsyncIOMotorClient] = None
db = None

async def connect_to_mongodb():
    """Connect to MongoDB"""
    global client, db
    if client is None:
        client = AsyncIOMotorClient(MONGODB_URI)
        db = client[MONGODB_DB_NAME]
        print(f"✅ Connected to MongoDB: {MONGODB_DB_NAME}")
    return db

async def close_mongodb_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed")

def get_database():
    """Get database instance"""
    return db

# ============================================
# Analysis History Collection
# ============================================

async def save_analysis(user_id: str, analysis_data: Dict[str, Any]) -> str:
    """Save an analysis to the database"""
    collection = db["analysis_history"]
    
    document = {
        "user_id": user_id,
        "timestamp": datetime.utcnow(),
        "type": analysis_data.get("type", "unknown"),
        "content_preview": analysis_data.get("contentPreview", ""),
        "result": analysis_data.get("result", {}),
        "metadata": {
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
    }
    
    result = await collection.insert_one(document)
    return str(result.inserted_id)

async def get_user_analyses(user_id: str, limit: int = 50, skip: int = 0) -> List[Dict]:
    """Get analysis history for a user"""
    collection = db["analysis_history"]
    
    cursor = collection.find(
        {"user_id": user_id}
    ).sort("timestamp", -1).skip(skip).limit(limit)
    
    analyses = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])  # Convert ObjectId to string
        analyses.append(doc)
    
    return analyses

async def get_analysis_by_id(analysis_id: str, user_id: str) -> Optional[Dict]:
    """Get a specific analysis by ID"""
    collection = db["analysis_history"]
    
    doc = await collection.find_one({
        "_id": ObjectId(analysis_id),
        "user_id": user_id
    })
    
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc

async def delete_analysis(analysis_id: str, user_id: str) -> bool:
    """Delete an analysis by ID"""
    collection = db["analysis_history"]
    
    result = await collection.delete_one({
        "_id": ObjectId(analysis_id),
        "user_id": user_id
    })
    
    return result.deleted_count > 0

async def clear_user_history(user_id: str) -> int:
    """Clear all analysis history for a user"""
    collection = db["analysis_history"]
    
    result = await collection.delete_many({"user_id": user_id})
    return result.deleted_count

async def get_user_stats(user_id: str) -> Dict:
    """Get analysis statistics for a user"""
    collection = db["analysis_history"]
    
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": None,
            "total_analyses": {"$sum": 1},
            "media_analyses": {
                "$sum": {"$cond": [{"$eq": ["$type", "media"]}, 1, 0]}
            },
            "text_analyses": {
                "$sum": {"$cond": [{"$eq": ["$type", "text"]}, 1, 0]}
            },
            "deepfakes_detected": {
                "$sum": {
                    "$cond": [
                        {"$or": [
                            {"$eq": ["$result.is_fake", True]},
                            {"$eq": ["$result.isOriginal", False]}
                        ]},
                        1, 0
                    ]
                }
            },
            "suspicious_content": {
                "$sum": {
                    "$cond": [
                        {"$lt": ["$result.trustScore", 50]},
                        1, 0
                    ]
                }
            }
        }}
    ]
    
    result = await collection.aggregate(pipeline).to_list(1)
    
    if result:
        stats = result[0]
        stats.pop("_id", None)
        return stats
    
    return {
        "total_analyses": 0,
        "media_analyses": 0,
        "text_analyses": 0,
        "deepfakes_detected": 0,
        "suspicious_content": 0
    }
```

---

## Step 5: Add API Endpoints

Update `src/backend/main.py` to add history endpoints:

```python
# Add at the top with other imports
from database import (
    connect_to_mongodb,
    close_mongodb_connection,
    save_analysis,
    get_user_analyses,
    get_analysis_by_id,
    delete_analysis,
    clear_user_history,
    get_user_stats
)
from pydantic import BaseModel
from typing import Optional, Dict, Any

# Add Pydantic models
class AnalysisInput(BaseModel):
    type: str
    contentPreview: Optional[str] = ""
    result: Dict[str, Any]

class HistoryQuery(BaseModel):
    limit: int = 50
    skip: int = 0

# Add startup/shutdown events
@app.on_event("startup")
async def startup_event():
    await connect_to_mongodb()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongodb_connection()

# ============================================
# History API Endpoints
# ============================================

@app.post("/api/history")
async def save_analysis_endpoint(
    analysis: AnalysisInput,
    user_id: str = "anonymous"  # Replace with actual auth
):
    """Save an analysis to history"""
    try:
        analysis_id = await save_analysis(user_id, analysis.dict())
        return {"success": True, "id": analysis_id}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/history")
async def get_history_endpoint(
    user_id: str = "anonymous",
    limit: int = 50,
    skip: int = 0
):
    """Get user's analysis history"""
    try:
        analyses = await get_user_analyses(user_id, limit, skip)
        return {"success": True, "data": analyses}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/history/{analysis_id}")
async def get_single_analysis(
    analysis_id: str,
    user_id: str = "anonymous"
):
    """Get a specific analysis"""
    try:
        analysis = await get_analysis_by_id(analysis_id, user_id)
        if analysis:
            return {"success": True, "data": analysis}
        return {"success": False, "error": "Not found"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.delete("/api/history/{analysis_id}")
async def delete_analysis_endpoint(
    analysis_id: str,
    user_id: str = "anonymous"
):
    """Delete a specific analysis"""
    try:
        deleted = await delete_analysis(analysis_id, user_id)
        return {"success": deleted}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.delete("/api/history")
async def clear_history_endpoint(user_id: str = "anonymous"):
    """Clear all history for a user"""
    try:
        count = await clear_user_history(user_id)
        return {"success": True, "deleted_count": count}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/stats")
async def get_stats_endpoint(user_id: str = "anonymous"):
    """Get analysis statistics"""
    try:
        stats = await get_user_stats(user_id)
        return {"success": True, "data": stats}
    except Exception as e:
        return {"success": False, "error": str(e)}
```

---

## Step 6: Update Frontend API Calls

Update `src/react-app/shared/utils/historyStorage.js`:

```javascript
/**
 * Analysis History Storage Utility
 * Now uses MongoDB backend with localStorage fallback
 */

const API_BASE = 'http://localhost:8000/api';
const HISTORY_KEY = 'defraudai_analysis_history';

// Get user ID from Clerk or use anonymous
function getUserId() {
    // If using Clerk, get actual user ID
    // return window.Clerk?.user?.id || 'anonymous';
    return 'anonymous';
}

export async function getAnalysisHistory() {
    try {
        const response = await fetch(`${API_BASE}/history?user_id=${getUserId()}`);
        const data = await response.json();
        
        if (data.success) {
            return data.data;
        }
        throw new Error(data.error);
    } catch (error) {
        console.warn('API failed, falling back to localStorage:', error);
        return getLocalHistory();
    }
}

export async function saveAnalysisToHistory(analysis) {
    try {
        const response = await fetch(`${API_BASE}/history?user_id=${getUserId()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(analysis)
        });
        const data = await response.json();
        
        if (data.success) {
            return { id: data.id, ...analysis };
        }
        throw new Error(data.error);
    } catch (error) {
        console.warn('API failed, falling back to localStorage:', error);
        return saveToLocalHistory(analysis);
    }
}

export async function deleteAnalysisById(id) {
    try {
        const response = await fetch(
            `${API_BASE}/history/${id}?user_id=${getUserId()}`,
            { method: 'DELETE' }
        );
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.warn('API failed, using localStorage:', error);
        return deleteFromLocalHistory(id);
    }
}

export async function clearAnalysisHistory() {
    try {
        const response = await fetch(
            `${API_BASE}/history?user_id=${getUserId()}`,
            { method: 'DELETE' }
        );
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.warn('API failed, using localStorage:', error);
        return clearLocalHistory();
    }
}

export async function getAnalysisStats() {
    try {
        const response = await fetch(`${API_BASE}/stats?user_id=${getUserId()}`);
        const data = await response.json();
        
        if (data.success) {
            return data.data;
        }
        throw new Error(data.error);
    } catch (error) {
        console.warn('API failed, calculating locally:', error);
        return calculateLocalStats();
    }
}

// ============================================
// LocalStorage Fallback Functions
// ============================================

function getLocalHistory() {
    try {
        const stored = localStorage.getItem(HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        return [];
    }
}

function saveToLocalHistory(analysis) {
    const history = getLocalHistory();
    const newEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        ...analysis,
    };
    history.unshift(newEntry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
    return newEntry;
}

function deleteFromLocalHistory(id) {
    const history = getLocalHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    return true;
}

function clearLocalHistory() {
    localStorage.removeItem(HISTORY_KEY);
    return true;
}

function calculateLocalStats() {
    const history = getLocalHistory();
    return {
        total_analyses: history.length,
        media_analyses: history.filter(h => h.type === 'media').length,
        text_analyses: history.filter(h => h.type === 'text').length,
        deepfakes_detected: history.filter(h => 
            h.result?.is_fake || h.result?.isOriginal === false
        ).length,
        suspicious_content: history.filter(h => 
            h.result?.trustScore < 50
        ).length
    };
}
```

---

## Step 7: Test the Setup

### 7.1 Restart the Backend

```bash
# Stop the current backend (Ctrl+C)
# Then restart
python src/backend/main.py
```

### 7.2 Test API Endpoints

// turbo
```bash
# Test health check
curl http://localhost:8000/

# Test saving an analysis
curl -X POST "http://localhost:8000/api/history?user_id=test" \
  -H "Content-Type: application/json" \
  -d '{"type":"text","contentPreview":"Test content","result":{"trustScore":75}}'

# Test getting history
curl "http://localhost:8000/api/history?user_id=test"

# Test getting stats
curl "http://localhost:8000/api/stats?user_id=test"
```

---

## Step 8: Integrate with Clerk Authentication (Optional)

If you want to tie history to actual users:

```javascript
// In historyStorage.js
import { useUser } from '@clerk/clerk-react';

function getUserId() {
    // This needs to be called from within a React component
    // For utility functions, pass the user ID as a parameter
    return 'anonymous';
}

// In your React components, get user ID like this:
const { user } = useUser();
const userId = user?.id || 'anonymous';
```

---

## Troubleshooting

### Connection Errors
- Check your MongoDB URI is correct
- Ensure your IP is whitelisted in Atlas
- Verify username/password are correct

### Import Errors
- Run `pip install pymongo motor python-dotenv`
- Check Python version is 3.8+

### CORS Issues
- The backend already has CORS enabled for all origins
- For production, restrict to your frontend domain

---

## Summary

After completing these steps, your project will:

✅ Store analysis history in MongoDB (persistent)
✅ Fall back to localStorage if database is unavailable
✅ Support user-specific history (when integrated with Clerk)
✅ Provide aggregated statistics

**Files Modified/Created:**
- `.env` - MongoDB connection string
- `src/backend/database.py` - New database module
- `src/backend/main.py` - Added API endpoints
- `src/react-app/shared/utils/historyStorage.js` - Updated to use API
