from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.config import settings
from app.models.user import User, Bookmark, RefreshToken
from app.models.remedy import Remedy
from app.models.spice import Spice
from app.models.seasonal_tip import SeasonalTip
from app.models.dosha_quiz import DoshaQuiz

# Global connection state
db_connected = False


async def init_db():
    """Initialize MongoDB connection and Beanie ODM."""
    global db_connected
    try:
        client = AsyncIOMotorClient(
            settings.mongodb_uri,
            serverSelectionTimeoutMS=5000,
        )

        # Verify connection is alive
        await client.admin.command("ping")

        database = client[settings.mongodb_db_name]

        await init_beanie(
            database=database,
            document_models=[
                User,
                Bookmark,
                RefreshToken,
                Remedy,
                Spice,
                SeasonalTip,
                DoshaQuiz,
            ],
        )
        db_connected = True
        print(f"[OK] Connected to MongoDB: {settings.mongodb_db_name}")
        return client

    except Exception as e:
        db_connected = False
        print(f"\n[WARN] MongoDB not available - running in DEMO mode")
        print(f"   Error: {type(e).__name__}: {e}")
        print(f"\n[TIP] To connect to a real database:")
        print(f"   1. Create a free cluster at https://cloud.mongodb.com")
        print(f"   2. Update MONGODB_URI in server/.env")
        print(f"   3. Whitelist your IP in Atlas -> Network Access")
        print(f"   4. Restart the server\n")
        return None
