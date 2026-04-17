from fastapi import APIRouter, HTTPException, Depends

from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.models.spice import Spice

router = APIRouter(prefix="/api/spices", tags=["Spices"])


@router.get("/")
async def list_spices():
    """Get all Phase 1 spices."""
    spices = await Spice.find(Spice.is_phase1 == True).to_list()
    return [
        {**s.dict(), "id": str(s.id)}
        for s in spices
    ]


@router.get("/{slug}")
async def get_spice(slug: str):
    """Get a single spice by URL slug."""
    spice = await Spice.find_one(Spice.slug == slug)
    if not spice:
        raise HTTPException(status_code=404, detail="Spice not found")

    return {**spice.dict(), "id": str(spice.id)}
