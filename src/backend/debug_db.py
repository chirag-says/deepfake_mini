
import asyncio
from database import connect_to_mongodb, get_password_hash, create_user
import os
from dotenv import load_dotenv
from pathlib import Path

# Load env manually to be sure
project_root = Path(__file__).resolve().parent.parent.parent
env_path = project_root / ".env"
load_dotenv(dotenv_path=env_path)

async def test():
    print("Testing MongoDB Connection...")
    db = await connect_to_mongodb()
    if db is not None:
        print("MongoDB Connected Successfully!")
    else:
        print("MongoDB Connection Failed!")
        return

    print("\nTesting Password Hashing...")
    try:
        pw = "test123"
        hashed = get_password_hash(pw)
        print(f"Hash success: {hashed[:10]}...")
    except Exception as e:
        print(f"Hashing failed: {e}")
        import traceback
        traceback.print_exc()

    print("\nTesting User Creation...")
    try:
        user = await create_user("debug_test@example.com", "password123", "Debug User")
        print(f"User creation result: {user}")
    except Exception as e:
        print(f"User creation failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
