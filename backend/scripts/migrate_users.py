import json
import asyncio
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings

async def migrate():
    USERS_FILE = Path("backend/data/users.json")
    if not USERS_FILE.exists():
        print(f"File {USERS_FILE} not found. Skipping migration.")
        return

    with open(USERS_FILE, "r") as f:
        users_data = json.load(f)

    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DB]
    
    print(f"Migrating {len(users_data)} users to MongoDB...")
    
    for username, data in users_data.items():
        existing = await db.users.find_one({"username": username})
        if not existing:
            user_doc = {
                "username": username,
                "name": data.get("name", username.split("@")[0].capitalize()),
                "hashed_password": data["hashed_password"],
                "disabled": data.get("disabled", False)
            }
            await db.users.insert_one(user_doc)
            print(f"Migrated user: {username}")
        else:
            print(f"User {username} already exists in MongoDB.")

    print("Migration complete.")

if __name__ == "__main__":
    asyncio.run(migrate())
