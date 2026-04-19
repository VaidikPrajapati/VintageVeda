from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.models.remedy import Remedy
from app.config import settings

router = APIRouter(prefix="/api/chatbot", tags=["VedaBot AI"])


class ChatMessage(BaseModel):
    message: str
    history: List[dict] = []


VEDABOT_SYSTEM_PROMPT = """
You are VedaBot, an Ayurvedic wellness assistant for Vintage Veda.

RULES (NEVER BREAK):
1. ALWAYS start with: "I am an AI assistant, not a medical doctor. 
   This is for informational purposes only. Please consult a qualified Ayurvedic practitioner."
2. Accept symptoms in natural language (Hindi-English mix OK).
3. Ask 1-2 follow-up questions if input is ambiguous.
4. Return: condition name + Dosha imbalance explanation + confidence level.
5. NEVER diagnose life-threatening conditions — redirect to doctor immediately.
6. If confidence is low → recommend a qualified practitioner.
7. Be empathetic, warm, culturally sensitive. No medical jargon.
8. NEVER prescribe dosages. Only suggest traditional remedy approaches.
9. Always remind: "These are traditional wellness practices, not medical prescriptions."

RESPOND IN THIS JSON FORMAT ONLY:
{
  "disease": "string",
  "doshaImbalance": "Vata/Pitta/Kapha imbalance description",
  "explanation": "Simple Ayurvedic explanation",
  "confidence": "high|medium|low",
  "isLifeThreatening": false,
  "followUpQuestion": "string or null",
  "suggestedRemedyKeywords": ["keyword1", "keyword2"]
}
"""


@router.post("/message")
async def chat_message(req: ChatMessage, user: User = Depends(get_current_user)):
    """Process user symptoms through Gemini AI and return Ayurvedic guidance."""

    # Rate limiting: 50 VedaBot sessions per day
    today = datetime.utcnow().date()
    if user.vedabot_last_reset is None or user.vedabot_last_reset.date() != today:
        user.vedabot_sessions_today = 0
        user.vedabot_last_reset = datetime.utcnow()

    if user.vedabot_sessions_today >= 50:
        raise HTTPException(status_code=429, detail="Daily VedaBot limit reached (50/day)")

    user.vedabot_sessions_today += 1
    await user.save()

    # Try Gemini first, fallback to OpenAI
    ai_response = None

    if settings.gemini_api_key:
        try:
            ai_response = await _call_gemini(req.message, req.history)
        except Exception as e:
            print(f"Gemini failed: {e}")
            import traceback
            traceback.print_exc()

    if ai_response is None and settings.openai_api_key:
        try:
            ai_response = await _call_openai(req.message, req.history)
        except Exception as e:
            print(f"OpenAI fallback failed: {e}")
            import traceback
            traceback.print_exc()

    if ai_response is None:
        # Fallback: return a safe default
        ai_response = {
            "disease": "Unable to assess",
            "doshaImbalance": "Please try again later",
            "explanation": "Our AI service is temporarily unavailable. Please try again in a moment.",
            "confidence": "low",
            "isLifeThreatening": False,
            "followUpQuestion": None,
            "suggestedRemedyKeywords": [],
        }

    # Fetch matching remedies from database
    remedies = []
    try:
        for keyword in ai_response.get("suggestedRemedyKeywords", []):
            results = await Remedy.find(
                {"$text": {"$search": keyword}, "status": "approved"}
            ).limit(3).to_list()
            for r in results:
                remedies.append({"id": str(r.id), "title": r.title, "disease": r.disease_name})
    except Exception as e:
        print(f"Remedy search failed: {e}")

    return {
        **ai_response,
        "remedies": remedies,
        "disclaimer": "I am an AI assistant, not a medical doctor. This is for informational purposes only.",
    }


async def _call_gemini(message: str, history: list) -> dict:
    """Call Google Gemini API using google-genai SDK."""
    import json
    import asyncio
    from google import genai

    client = genai.Client(api_key=settings.gemini_api_key)

    def _generate():
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"{VEDABOT_SYSTEM_PROMPT}\n\nUser says: {message}",
        )
        return response.text

    text = await asyncio.to_thread(_generate)
    print(f"[VedaBot] Gemini raw response length: {len(text)}")

    # Parse JSON from response
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0]
    elif "```" in text:
        text = text.split("```")[1].split("```")[0]

    result = json.loads(text.strip())
    print(f"[VedaBot] Parsed response: {result.get('disease', 'unknown')}")
    return result


async def _call_openai(message: str, history: list) -> dict:
    """Call OpenAI API as fallback."""
    from openai import AsyncOpenAI
    import json

    client = AsyncOpenAI(api_key=settings.openai_api_key)

    response = await client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": VEDABOT_SYSTEM_PROMPT},
            {"role": "user", "content": message},
        ],
        response_format={"type": "json_object"},
    )

    return json.loads(response.choices[0].message.content)
