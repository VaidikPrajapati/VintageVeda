"""Master seed runner - seeds all collections."""

import asyncio
from app.seeds.seed_remedies import seed_remedies
from app.seeds.seed_spices import seed_spices
from app.seeds.seed_admin import seed_admin


async def run_all():
    print("Starting database seeding...")
    await seed_remedies()
    await seed_spices()
    await seed_admin()
    print("\nAll seeds completed!")


if __name__ == "__main__":
    asyncio.run(run_all())
