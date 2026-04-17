from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime

from app.middleware.auth_middleware import get_current_user
from app.models.user import User, Bookmark

router = APIRouter(prefix="/api/bookmarks", tags=["Bookmarks"])


@router.get("/")
async def get_bookmarks(user: User = Depends(get_current_user)):
    """Get all bookmarked remedies for the current user."""
    bookmarks = await Bookmark.find(
        Bookmark.user_id == str(user.id)
    ).sort("-created_at").to_list()

    # Fetch the actual remedies
    from app.models.remedy import Remedy
    result = []
    for bm in bookmarks:
        remedy = await Remedy.get(bm.remedy_id)
        if remedy:
            result.append({
                "bookmark_id": str(bm.id),
                "remedy": {**remedy.dict(), "id": str(remedy.id)},
                "saved_at": bm.created_at.isoformat(),
            })

    return result


@router.post("/{remedy_id}")
async def add_bookmark(remedy_id: str, user: User = Depends(get_current_user)):
    """Save a remedy to bookmarks."""
    # Check if already bookmarked
    existing = await Bookmark.find_one(
        Bookmark.user_id == str(user.id),
        Bookmark.remedy_id == remedy_id,
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already bookmarked")

    bookmark = Bookmark(
        user_id=str(user.id),
        remedy_id=remedy_id,
    )
    await bookmark.insert()

    return {"message": "Remedy bookmarked", "id": str(bookmark.id)}


@router.delete("/{remedy_id}")
async def remove_bookmark(remedy_id: str, user: User = Depends(get_current_user)):
    """Remove a remedy from bookmarks."""
    bookmark = await Bookmark.find_one(
        Bookmark.user_id == str(user.id),
        Bookmark.remedy_id == remedy_id,
    )
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    await bookmark.delete()
    return {"message": "Bookmark removed"}
