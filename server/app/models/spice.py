from beanie import Document, Indexed
from pydantic import BaseModel
from typing import List


class SpiceRecipe(BaseModel):
    """Mini recipe embedded in a spice document."""
    title: str
    for_disease: str
    ingredients: List[str]
    steps: List[str]


class Spice(Document):
    """Ayurvedic spice encyclopedia entry."""

    name: str
    slug: Indexed(str, unique=True)             # URL-friendly: "turmeric"
    sanskrit_name: str = ""                     # "Haridra"
    botanical_name: str = ""                    # "Curcuma longa"
    image_url: str = ""

    dosha_balance: str = ""                     # "Balances Pitta & Kapha"
    benefits: List[str] = []                    # 4-6 bullet points
    cautions: List[str] = []
    allergen_warning: str = ""

    recipes: List[SpiceRecipe] = []             # 2-3 recipes each

    is_phase1: bool = True                      # Phase 1 = first 15 spices

    class Settings:
        name = "spices"
