from beanie import Document, Indexed
from typing import List


class SeasonalTip(Document):
    """Seasonal wellness tips mapped to Indian seasons."""

    season: Indexed(str)                        # 'summer'|'monsoon'|'autumn'|'winter'
    months: List[int]                           # e.g. [4, 5, 6] for summer
    title: str
    recommended_foods: List[str]
    avoid_foods: List[str]
    tips: List[str]

    class Settings:
        name = "seasonal_tips"
