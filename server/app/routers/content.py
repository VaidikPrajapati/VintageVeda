from fastapi import APIRouter
from datetime import datetime

from app.models.seasonal_tip import SeasonalTip

router = APIRouter(prefix="/api/content", tags=["Content"])


def get_current_season() -> str:
    """Determine the current Indian season based on month."""
    month = datetime.utcnow().month
    if month in [3, 4, 5]:
        return "summer"
    elif month in [6, 7, 8]:
        return "monsoon"
    elif month in [9, 10, 11]:
        return "autumn"
    else:
        return "winter"


@router.get("/seasonal")
async def get_seasonal_tips():
    """Get wellness tips for the current season."""
    season = get_current_season()
    tip = await SeasonalTip.find_one(SeasonalTip.season == season)

    if not tip:
        return {
            "season": season,
            "message": "No seasonal tips available yet.",
        }

    return {**tip.dict(), "id": str(tip.id)}
