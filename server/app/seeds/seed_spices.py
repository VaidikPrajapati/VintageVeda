"""Seed 15 Phase 1 Ayurvedic spices into MongoDB."""

import asyncio
from app.database import init_db
from app.models.spice import Spice, SpiceRecipe


SPICES_DATA = [
    {"name": "Turmeric", "slug": "turmeric", "sanskrit_name": "Haridra", "botanical_name": "Curcuma longa", "dosha_balance": "Balances Pitta & Kapha", "benefits": ["Powerful anti-inflammatory", "Blood purifier", "Enhances skin complexion", "Supports liver health", "Natural antiseptic"], "cautions": ["High doses can upset stomach", "Avoid before surgery (blood thinning)", "May interact with diabetes medication"], "recipes": [{"title": "Golden Milk", "for_disease": "Joint Pain", "ingredients": ["1 tsp turmeric", "1 glass warm milk", "Pinch of black pepper"], "steps": ["Warm milk", "Add turmeric and pepper", "Stir well and drink"]}]},
    {"name": "Cumin", "slug": "cumin", "sanskrit_name": "Jiraka", "botanical_name": "Cuminum cyminum", "dosha_balance": "Balances Vata & Kapha", "benefits": ["Enhances digestion", "Improves nutrient absorption", "Rich in iron", "Reduces bloating"], "cautions": ["Excessive use may lower blood sugar"], "recipes": [{"title": "Jeera Water", "for_disease": "Bloating", "ingredients": ["1 tsp cumin seeds", "1 glass water"], "steps": ["Soak cumin overnight", "Strain and drink in morning"]}]},
    {"name": "Fennel", "slug": "fennel", "sanskrit_name": "Shatapushpa", "botanical_name": "Foeniculum vulgare", "dosha_balance": "Balances Pitta & Vata", "benefits": ["Cooling digestive spice", "Relieves bloating and gas", "Freshens breath", "Supports eye health"], "cautions": ["May interact with blood thinners"], "recipes": []},
    {"name": "Cardamom", "slug": "cardamom", "sanskrit_name": "Ela", "botanical_name": "Elettaria cardamomum", "dosha_balance": "Balances all three doshas", "benefits": ["Reduces stomach acid", "Natural breath freshener", "Supports respiratory health", "Mood uplifter"], "cautions": ["Avoid in gallstone conditions"], "recipes": []},
    {"name": "Ginger", "slug": "ginger", "sanskrit_name": "Shunthi", "botanical_name": "Zingiber officinale", "dosha_balance": "Balances Vata & Kapha", "benefits": ["Universal medicine in Ayurveda", "Kindles digestive fire (Agni)", "Anti-nausea", "Clears respiratory congestion", "Boosts circulation"], "cautions": ["Avoid in bleeding disorders", "May interact with blood thinners", "Reduce during pregnancy"], "recipes": [{"title": "Ginger Lemon Shot", "for_disease": "Indigestion", "ingredients": ["1 tsp ginger juice", "1 tsp lemon", "Rock salt"], "steps": ["Mix all ingredients", "Take before meals"]}]},
    {"name": "Coriander", "slug": "coriander", "sanskrit_name": "Dhanyaka", "botanical_name": "Coriandrum sativum", "dosha_balance": "Balances Pitta", "benefits": ["Cooling herb", "Alleviates burning sensations", "Supports kidney function", "Natural detoxifier"], "cautions": ["May cause sensitivity in some people"], "recipes": []},
    {"name": "Black Pepper", "slug": "black-pepper", "sanskrit_name": "Maricha", "botanical_name": "Piper nigrum", "dosha_balance": "Balances Kapha & Vata", "benefits": ["Enhances bioavailability of nutrients", "Stimulates metabolism", "Clears sinuses", "Supports respiratory health"], "cautions": ["Avoid in excessive Pitta", "Can irritate stomach lining in excess"], "recipes": []},
    {"name": "Cinnamon", "slug": "cinnamon", "sanskrit_name": "Twak", "botanical_name": "Cinnamomum verum", "dosha_balance": "Balances Kapha & Vata", "benefits": ["Regulates blood sugar", "Improves circulation", "Warming and comforting", "Natural antimicrobial"], "cautions": ["Avoid Cassia cinnamon in large doses", "May interact with diabetes medication"], "recipes": []},
    {"name": "Ashwagandha", "slug": "ashwagandha", "sanskrit_name": "Ashwagandha", "botanical_name": "Withania somnifera", "dosha_balance": "Balances Vata & Kapha", "benefits": ["Premier adaptogenic herb", "Reduces stress and cortisol", "Boosts vitality and strength", "Supports deep restful sleep", "Enhances male reproductive health"], "cautions": ["Avoid during pregnancy", "May interact with thyroid medication", "Start with low doses"], "recipes": []},
    {"name": "Fenugreek", "slug": "fenugreek", "sanskrit_name": "Methi", "botanical_name": "Trigonella foenum-graecum", "dosha_balance": "Balances Vata & Kapha", "benefits": ["Supports lactation", "Blood sugar balance", "Digestive health", "Hair and skin nourishment"], "cautions": ["Avoid in pregnancy (may induce contractions)", "Can interact with blood thinners"], "recipes": []},
    {"name": "Clove", "slug": "clove", "sanskrit_name": "Lavanga", "botanical_name": "Syzygium aromaticum", "dosha_balance": "Balances Kapha & Vata", "benefits": ["Natural analgesic (pain relief)", "Excellent for dental pain", "Fights respiratory infections", "Powerful antioxidant"], "cautions": ["Avoid clove oil directly on skin (irritant)", "Use in moderation during pregnancy"], "recipes": []},
    {"name": "Saffron", "slug": "saffron", "sanskrit_name": "Kunkuma", "botanical_name": "Crocus sativus", "dosha_balance": "Balances all three doshas", "benefits": ["Enhances complexion and glow", "Mood uplifter and antidepressant", "Improves cognitive function", "Supports reproductive health"], "cautions": ["Very expensive — buy from trusted sources", "Avoid in excess during pregnancy"], "recipes": []},
    {"name": "Tulsi", "slug": "tulsi", "sanskrit_name": "Tulasi", "botanical_name": "Ocimum tenuiflorum", "dosha_balance": "Balances Kapha & Vata", "benefits": ["Holy basil — queen of herbs", "Powerful adaptogen", "Immunity booster", "Natural anti-viral and anti-bacterial", "Respiratory support"], "cautions": ["May lower blood sugar", "Avoid before surgery"], "recipes": []},
    {"name": "Neem", "slug": "neem", "sanskrit_name": "Nimba", "botanical_name": "Azadirachta indica", "dosha_balance": "Balances Pitta & Kapha", "benefits": ["Nature's purifier", "Antibacterial and antifungal", "Blood-cleansing properties", "Excellent for skin conditions", "Natural pesticide"], "cautions": ["Very bitter — mix with honey", "Avoid during pregnancy", "Not for long-term internal use"], "recipes": []},
    {"name": "Amla", "slug": "amla", "sanskrit_name": "Amalaki", "botanical_name": "Emblica officinalis", "dosha_balance": "Balances all three doshas", "benefits": ["Richest natural source of Vitamin C", "Powerful rejuvenating tonic (Rasayana)", "Strengthens hair and prevents graying", "Supports digestive health", "Anti-aging properties"], "cautions": ["May cause acid reflux if taken on empty stomach in excess", "Avoid with cough/cold symptoms initially"], "recipes": []},
]


async def seed_spices():
    """Seed spices into the database."""
    await init_db()

    existing = await Spice.count()
    if existing > 0:
        print(f"[SKIP] {existing} spices already exist. Skipping seed.")
        return

    for data in SPICES_DATA:
        recipes_data = data.pop("recipes", [])
        recipes = [SpiceRecipe(**r) for r in recipes_data]
        spice = Spice(**data, recipes=recipes)
        await spice.insert()

    print(f"[OK] Seeded {len(SPICES_DATA)} spices")


if __name__ == "__main__":
    asyncio.run(seed_spices())
