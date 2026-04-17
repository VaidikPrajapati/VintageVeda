"""Seed admin account into MongoDB."""

import asyncio
import bcrypt
from app.database import init_db
from app.models.user import User


async def seed_admin():
    """Create default admin account."""
    await init_db()

    existing = await User.find_one(User.role == "admin")
    if existing:
        print(f"[SKIP] Admin already exists: {existing.email}")
        return

    password = "VintageVeda@Admin2026"
    pw_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    admin = User(
        full_name="Admin",
        email="admin@vintageveda.com",
        password_hash=pw_hash,
        email_verified=True,
        role="admin",
        profile_complete=True,
        dosha_type="kapha",
    )
    await admin.insert()
    print("[OK] Admin account created: admin@vintageveda.com")


if __name__ == "__main__":
    asyncio.run(seed_admin())

