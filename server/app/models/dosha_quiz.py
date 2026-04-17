from beanie import Document
from pydantic import BaseModel
from typing import List


class DoshaPoints(BaseModel):
    """Points awarded to each dosha for a quiz answer."""
    vata: int = 0
    pitta: int = 0
    kapha: int = 0


class QuizOption(BaseModel):
    """Single answer option with dosha point allocation."""
    text: str
    dosha_points: DoshaPoints


class QuizQuestion(BaseModel):
    """A single quiz question with multiple dosha-scored options."""
    question_text: str
    options: List[QuizOption]


class DoshaQuiz(Document):
    """Complete Dosha assessment quiz stored as a single document."""

    questions: List[QuizQuestion]
    is_active: bool = True

    class Settings:
        name = "dosha_quiz"
