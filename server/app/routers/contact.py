from fastapi import APIRouter
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/api/contact", tags=["Contact"])


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


@router.post("/")
async def submit_contact(req: ContactRequest):
    """Handle contact form submissions."""
    # TODO: Send email notification to admin via email_service
    # await send_contact_notification(req.name, req.email, req.subject, req.message)

    return {"message": "Thank you for reaching out! We'll get back to you soon."}
