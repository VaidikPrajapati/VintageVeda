from beanie import Document, Indexed
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from pymongo import IndexModel, TEXT


class Ingredient(BaseModel):
    """Sub-document for remedy ingredients."""
    name: str
    quantity: str


class Remedy(Document):
    """Ayurvedic remedy - the core content unit of the platform."""

    disease_name: str
    title: str
    short_description: str = Field(max_length=300)

    ingredients: List[Ingredient]
    preparation_steps: List[str]
    preparation_method: str = ""                # 'kashayam'|'churna'|'lepa'|'taila'|'tea'|'paste'|'other'

    category: Indexed(str) = ""                 # 'respiratory'|'digestive'|'mental_health'|'skin_hair'|...
    has_allergens: bool = False
    allergens_list: List[str] = []

    dosha_balance: str = ""                     # e.g. "Balances Pitta & Kapha"

    author_id: str = ""                         # MongoDB User ID
    author_name: str = ""

    status: Indexed(str) = "pending"            # 'pending'|'approved'|'rejected'
    rejection_reason: str = ""
    source: str = "curated"                     # 'community'|'curated'

    upvotes: int = 0
    upvoted_by: List[str] = []

    image_url: str = ""

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "remedies"
        indexes = [
            IndexModel(
                [("disease_name", TEXT), ("title", TEXT)],
                name="remedy_text_search",
            ),
        ]
