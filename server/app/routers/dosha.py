from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from datetime import datetime

from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.models.dosha_quiz import DoshaQuiz

router = APIRouter(prefix="/api/dosha", tags=["Dosha Quiz"])


class DoshaAnswerSubmission(BaseModel):
    answers: List[int]  # Index of selected option per question


@router.get("/quiz")
async def get_quiz():
    """Get the active Dosha quiz questions."""
    quiz = await DoshaQuiz.find_one(DoshaQuiz.is_active == True)
    if not quiz:
        return {"questions": [], "message": "No active quiz found"}

    return {
        "id": str(quiz.id),
        "questions": [q.dict() for q in quiz.questions],
    }


@router.post("/result")
async def submit_result(
    submission: DoshaAnswerSubmission,
    user: User = Depends(get_current_user),
):
    """Submit quiz answers, calculate dominant dosha, save to user profile."""
    quiz = await DoshaQuiz.find_one(DoshaQuiz.is_active == True)
    if not quiz:
        return {"error": "No active quiz"}

    # Tally dosha points
    vata = pitta = kapha = 0
    for i, answer_idx in enumerate(submission.answers):
        if i < len(quiz.questions) and answer_idx < len(quiz.questions[i].options):
            points = quiz.questions[i].options[answer_idx].dosha_points
            vata += points.vata
            pitta += points.pitta
            kapha += points.kapha

    # Determine dominant dosha
    scores = {"vata": vata, "pitta": pitta, "kapha": kapha}
    dominant = max(scores, key=scores.get)

    # Save to user profile
    user.dosha_type = dominant
    user.updated_at = datetime.utcnow()
    await user.save()

    return {
        "dominant_dosha": dominant,
        "scores": scores,
        "message": f"Your dominant dosha is {dominant.capitalize()}!",
    }
