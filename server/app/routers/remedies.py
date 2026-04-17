from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime

from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.models.remedy import Remedy

router = APIRouter(prefix="/api/remedies", tags=["Remedies"])


@router.get("/search")
async def search_remedies(
    type: str = Query("disease", description="Search type: 'disease' or 'ingredient'"),
    q: str = Query("", description="Search query"),
):
    """Search remedies by disease name or ingredient."""
    if not q:
        # Return all approved remedies if empty query
        results = await Remedy.find(
            Remedy.status == "approved"
        ).sort("-upvotes").to_list()
    elif type == "disease":
        results = await Remedy.find(
            {"disease_name": {"$regex": q, "$options": "i"}, "status": "approved"}
        ).to_list()
    elif type == "ingredient":
        results = await Remedy.find(
            {"ingredients.name": {"$regex": q, "$options": "i"}, "status": "approved"}
        ).to_list()
    else:
        results = []

    output = []
    for r in results:
        remedy_dict = r.dict()
        remedy_dict["id"] = str(r.id)
        output.append(remedy_dict)

    return {"results": output, "count": len(output), "query": q, "type": type}


@router.get("/featured")
async def featured_remedies():
    """Get approved featured remedies for the landing page."""
    results = await Remedy.find(
        Remedy.status == "approved"
    ).sort("-upvotes").limit(6).to_list()

    return [
        {**r.dict(), "id": str(r.id)}
        for r in results
    ]


@router.get("/remedy-of-day")
async def remedy_of_day():
    """Get today's rotating featured remedy."""
    # Simple rotation: use day-of-year modulo total approved remedies
    count = await Remedy.find(Remedy.status == "approved").count()
    if count == 0:
        return None

    from datetime import date
    day_index = date.today().timetuple().tm_yday % count

    remedy = await Remedy.find(
        Remedy.status == "approved"
    ).sort("created_at").skip(day_index).limit(1).to_list()

    if remedy:
        r = remedy[0]
        return {**r.dict(), "id": str(r.id)}
    return None


@router.get("/autocomplete")
async def autocomplete(
    type: str = Query("disease"),
    q: str = Query(""),
):
    """Autocomplete suggestions for search input."""
    if not q or len(q) < 2:
        return {"suggestions": []}

    if type == "disease":
        results = await Remedy.find(
            {"disease_name": {"$regex": f"^{q}", "$options": "i"}, "status": "approved"}
        ).limit(8).to_list()
        suggestions = list(set(r.disease_name for r in results))
    else:
        results = await Remedy.find(
            {"ingredients.name": {"$regex": f"^{q}", "$options": "i"}, "status": "approved"}
        ).limit(8).to_list()
        suggestions = list(set(
            ing.name for r in results for ing in r.ingredients
            if q.lower() in ing.name.lower()
        ))

    return {"suggestions": suggestions[:8]}


@router.get("/{remedy_id}")
async def get_remedy(remedy_id: str, user: User = Depends(get_current_user)):
    """Get full remedy detail by ID."""
    remedy = await Remedy.get(remedy_id)
    if not remedy or remedy.status != "approved":
        raise HTTPException(status_code=404, detail="Remedy not found")

    result = {**remedy.dict(), "id": str(remedy.id)}

    # Check allergies
    if user.has_allergies and user.allergies:
        matching = []
        for allergen in user.allergies:
            if allergen.lower() in [a.lower() for a in remedy.allergens_list]:
                matching.append(allergen)
            for ing in remedy.ingredients:
                if allergen.lower() in ing.name.lower():
                    matching.append(allergen)
        result["user_allergy_warning"] = len(matching) > 0
        result["matching_allergens"] = list(set(matching))

    return result


@router.post("/submit")
async def submit_remedy(
    disease_name: str,
    title: str,
    short_description: str,
    ingredients: List[dict],
    preparation_steps: List[str],
    preparation_method: str = "other",
    category: str = "",
    has_allergens: bool = False,
    allergens_list: List[str] = [],
    user: User = Depends(get_current_user),
):
    """Submit a community remedy for moderation."""
    from app.models.remedy import Ingredient

    remedy = Remedy(
        disease_name=disease_name,
        title=title,
        short_description=short_description,
        ingredients=[Ingredient(**ing) for ing in ingredients],
        preparation_steps=preparation_steps,
        preparation_method=preparation_method,
        category=category,
        has_allergens=has_allergens,
        allergens_list=allergens_list,
        author_id=str(user.id),
        author_name=user.full_name,
        status="pending",
        source="community",
    )
    await remedy.insert()

    return {"message": "Remedy submitted for review", "id": str(remedy.id)}


@router.put("/{remedy_id}/upvote")
async def toggle_upvote(remedy_id: str, user: User = Depends(get_current_user)):
    """Toggle upvote on a remedy. Prevents double-voting."""
    remedy = await Remedy.get(remedy_id)
    if not remedy:
        raise HTTPException(status_code=404, detail="Remedy not found")

    user_id = str(user.id)
    if user_id in remedy.upvoted_by:
        remedy.upvoted_by.remove(user_id)
        remedy.upvotes -= 1
    else:
        remedy.upvoted_by.append(user_id)
        remedy.upvotes += 1

    remedy.updated_at = datetime.utcnow()
    await remedy.save()

    return {"upvotes": remedy.upvotes, "is_upvoted": user_id in remedy.upvoted_by}
