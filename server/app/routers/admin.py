from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime

from app.middleware.auth_middleware import require_admin
from app.models.user import User
from app.models.remedy import Remedy

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/submissions")
async def get_pending_submissions(admin: User = Depends(require_admin)):
    """Get all pending community remedy submissions."""
    pending = await Remedy.find(Remedy.status == "pending").sort("-created_at").to_list()
    return [
        {**r.dict(), "id": str(r.id)}
        for r in pending
    ]


@router.put("/submissions/{remedy_id}/approve")
async def approve_submission(remedy_id: str, admin: User = Depends(require_admin)):
    """Approve a pending remedy — makes it visible to all users."""
    remedy = await Remedy.get(remedy_id)
    if not remedy:
        raise HTTPException(status_code=404, detail="Remedy not found")
    if remedy.status != "pending":
        raise HTTPException(status_code=400, detail="Remedy is not pending")

    remedy.status = "approved"
    remedy.updated_at = datetime.utcnow()
    await remedy.save()

    return {"message": "Remedy approved", "id": str(remedy.id)}


@router.put("/submissions/{remedy_id}/reject")
async def reject_submission(
    remedy_id: str,
    reason: str = "Does not meet quality standards",
    admin: User = Depends(require_admin),
):
    """Reject a pending remedy with a reason."""
    remedy = await Remedy.get(remedy_id)
    if not remedy:
        raise HTTPException(status_code=404, detail="Remedy not found")
    if remedy.status != "pending":
        raise HTTPException(status_code=400, detail="Remedy is not pending")

    remedy.status = "rejected"
    remedy.rejection_reason = reason
    remedy.updated_at = datetime.utcnow()
    await remedy.save()

    return {"message": "Remedy rejected", "id": str(remedy.id)}


@router.get("/stats")
async def admin_stats(admin: User = Depends(require_admin)):
    """Dashboard statistics for the admin panel."""
    total_users = await User.count()
    total_remedies = await Remedy.find(Remedy.status == "approved").count()
    pending_submissions = await Remedy.find(Remedy.status == "pending").count()
    community_remedies = await Remedy.find(Remedy.source == "community", Remedy.status == "approved").count()

    return {
        "total_users": total_users,
        "total_remedies": total_remedies,
        "pending_submissions": pending_submissions,
        "community_remedies": community_remedies,
    }
