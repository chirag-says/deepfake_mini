"""
MongoDB Database Module for DeFraudAI
Handles user authentication and analysis history storage
"""

import os
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime, timedelta
from bson import ObjectId
from typing import Optional, List, Dict, Any
from jose import JWTError, jwt
import bcrypt

# Load .env from project root (2 directories up from this file)
project_root = Path(__file__).resolve().parent.parent.parent
env_path = project_root / ".env"
load_dotenv(dotenv_path=env_path)

# ============================================
# Configuration
# ============================================
MONGODB_URI = os.getenv("MONGODB_URI", "")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "defraudai")
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "CRITICAL: JWT_SECRET_KEY environment variable is not set. "
        "The application cannot start without a secure secret key. "
        "Please set JWT_SECRET_KEY in your .env file or environment."
    )
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# MongoDB client
client: Optional[AsyncIOMotorClient] = None
db = None

async def connect_to_mongodb():
    """Connect to MongoDB"""
    global client, db
    if not MONGODB_URI:
        print("⚠️  MONGODB_URI not set. Database features will be disabled.")
        return None
    
    if client is None:
        try:
            client = AsyncIOMotorClient(MONGODB_URI)
            db = client[MONGODB_DB_NAME]
            # Test connection
            await client.admin.command('ping')
            print(f"✅ Connected to MongoDB: {MONGODB_DB_NAME}")
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            return None
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


import bcrypt

# ============================================
# Password Utilities
# ============================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception as e:
        print(f"Password verification error: {e}")
        return False


def get_password_hash(password: str) -> str:
    """Hash a password"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


# ============================================
# User Collection
# ============================================

async def create_user(email: str, password: str, name: str) -> Optional[Dict]:
    """Create a new user"""
    if db is None:
        return None
    
    collection = db["users"]
    
    # Check if user already exists
    existing = await collection.find_one({"email": email.lower()})
    if existing:
        return None
    
    user_doc = {
        "email": email.lower(),
        "password_hash": get_password_hash(password),
        "name": name,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True,
        "profile": {
            "avatar": None,
            "bio": "",
        }
    }
    
    result = await collection.insert_one(user_doc)
    user_doc["_id"] = str(result.inserted_id)
    del user_doc["password_hash"]  # Don't return password hash
    return user_doc


async def authenticate_user(email: str, password: str) -> Optional[Dict]:
    """Authenticate a user and return user data if valid"""
    if db is None:
        return None
    
    collection = db["users"]
    user = await collection.find_one({"email": email.lower()})
    
    if not user:
        return None
    
    if not verify_password(password, user["password_hash"]):
        return None
    
    # Return user without password hash
    user["_id"] = str(user["_id"])
    del user["password_hash"]
    return user


async def get_user_by_id(user_id: str) -> Optional[Dict]:
    """Get user by ID"""
    if db is None:
        return None
    
    collection = db["users"]
    try:
        user = await collection.find_one({"_id": ObjectId(user_id)})
        if user:
            user["_id"] = str(user["_id"])
            del user["password_hash"]
            return user
    except:
        pass
    return None


async def get_user_by_email(email: str) -> Optional[Dict]:
    """Get user by email"""
    if db is None:
        return None
    
    collection = db["users"]
    user = await collection.find_one({"email": email.lower()})
    if user:
        user["_id"] = str(user["_id"])
        if "password_hash" in user:
            del user["password_hash"]
        return user
    return None


async def update_user(user_id: str, update_data: Dict) -> bool:
    """Update user profile"""
    if db is None:
        return False
    
    collection = db["users"]
    update_data["updated_at"] = datetime.utcnow()
    
    result = await collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    return result.modified_count > 0


# ============================================
# Analysis History Collection
# ============================================

async def save_analysis(user_id: str, analysis_data: Dict[str, Any]) -> Optional[str]:
    """Save an analysis to the database"""
    if db is None:
        return None
    
    collection = db["analysis_history"]
    
    document = {
        "user_id": user_id,
        "timestamp": datetime.utcnow(),
        "type": analysis_data.get("type", "unknown"),
        "content_preview": analysis_data.get("contentPreview", ""),
        "result": analysis_data.get("result", {}),
        "metadata": {
            "created_at": datetime.utcnow(),
        }
    }
    
    result = await collection.insert_one(document)
    return str(result.inserted_id)


async def get_user_analyses(user_id: str, limit: int = 50, skip: int = 0) -> List[Dict]:
    """Get analysis history for a user"""
    if db is None:
        return []
    
    collection = db["analysis_history"]
    
    cursor = collection.find(
        {"user_id": user_id}
    ).sort("timestamp", -1).skip(skip).limit(limit)
    
    analyses = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doc["id"] = doc["_id"]  # Add id field for frontend compatibility
        analyses.append(doc)
    
    return analyses


async def get_analysis_by_id(analysis_id: str, user_id: str) -> Optional[Dict]:
    """Get a specific analysis by ID"""
    if db is None:
        return None
    
    collection = db["analysis_history"]
    
    try:
        doc = await collection.find_one({
            "_id": ObjectId(analysis_id),
            "user_id": user_id
        })
        
        if doc:
            doc["_id"] = str(doc["_id"])
            doc["id"] = doc["_id"]
        return doc
    except:
        return None


async def delete_analysis(analysis_id: str, user_id: str) -> bool:
    """Delete an analysis by ID"""
    if db is None:
        return False
    
    collection = db["analysis_history"]
    
    try:
        result = await collection.delete_one({
            "_id": ObjectId(analysis_id),
            "user_id": user_id
        })
        return result.deleted_count > 0
    except:
        return False


async def clear_user_history(user_id: str) -> int:
    """Clear all analysis history for a user"""
    if db is None:
        return 0
    
    collection = db["analysis_history"]
    result = await collection.delete_many({"user_id": user_id})
    return result.deleted_count


async def get_user_stats(user_id: str) -> Dict:
    """Get analysis statistics for a user"""
    if db is None:
        return {
            "totalAnalyses": 0,
            "mediaAnalyses": 0,
            "textAnalyses": 0,
            "deepfakesDetected": 0,
            "suspiciousContent": 0,
            "thisWeek": 0,
            "thisMonth": 0
        }
    
    collection = db["analysis_history"]
    
    # Get counts
    total = await collection.count_documents({"user_id": user_id})
    media = await collection.count_documents({"user_id": user_id, "type": "media"})
    text = await collection.count_documents({"user_id": user_id, "type": "text"})
    
    # Time-based queries
    week_ago = datetime.utcnow() - timedelta(days=7)
    month_ago = datetime.utcnow() - timedelta(days=30)
    
    this_week = await collection.count_documents({
        "user_id": user_id,
        "timestamp": {"$gte": week_ago}
    })
    this_month = await collection.count_documents({
        "user_id": user_id,
        "timestamp": {"$gte": month_ago}
    })
    
    # Count deepfakes and suspicious content
    deepfakes = await collection.count_documents({
        "user_id": user_id,
        "$or": [
            {"result.is_fake": True},
            {"result.isOriginal": False}
        ]
    })
    
    suspicious = await collection.count_documents({
        "user_id": user_id,
        "result.trustScore": {"$lt": 50}
    })
    
    return {
        "totalAnalyses": total,
        "mediaAnalyses": media,
        "textAnalyses": text,
        "deepfakesDetected": deepfakes,
        "suspiciousContent": suspicious,
        "thisWeek": this_week,
        "thisMonth": this_month
    }
