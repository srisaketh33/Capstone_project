import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def get_db():
    if db.client is None:
        try:
            db.client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                tlsCAFile=certifi.where(),
                serverSelectionTimeoutMS=5000
            )
            # Verify connectivity
            await db.client.admin.command('ismaster')
        except Exception as e:
            print(f"CRITICAL: Failed to connect to MongoDB: {e}")
            db.client = None
            raise e
    return db.client[settings.MONGODB_DB]
