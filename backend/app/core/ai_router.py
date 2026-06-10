import logging
import json
from typing import Optional
import google.generativeai as genai
from groq import Groq

from backend.app.core.config import settings

logger = logging.getLogger("fitnaija.ai")

# Initialize API clients
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
    genai.configure(api_key=settings.GEMINI_API_KEY)
else:
    logger.warning("Google Gemini API Key is not configured. Falling back to Mock mode.")

groq_client = None
if settings.GROQ_API_KEY and settings.GROQ_API_KEY != "your_groq_api_key_here":
    groq_client = Groq(api_key=settings.GROQ_API_KEY)
else:
    logger.warning("Groq API Key is not configured. Falling back to Gemini for chat.")

async def verify_screenshot_proof(image_bytes: bytes, mime_type: str) -> dict:
    """Analyze screenshot proof image via Gemini Multimodal Vision API.
    Extracts steps, distance, and duration text, returning parsed parameters.
    """
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "your_gemini_api_key_here":
        print("\nDEVELOPMENT GEMINI VISION FALLBACK: Image proof processed successfully (Auto-Verify).\n")
        return {"steps": None, "distance_m": None, "duration_sec": None, "status": "verified"}

    prompt = """
    Analyze this workout screenshot (from a smartwatch, treadmill display, or running app). 
    Extract the following three variables if visible:
    1. Total step count (integer)
    2. Total distance (float, convert to meters if unit is km/miles)
    3. Duration/time (convert to seconds)
    
    Return the result strictly as a valid JSON object with the keys:
    "steps": int or null,
    "distance_m": float or null,
    "duration_sec": int or null,
    "confidence_score": float (0.0 to 1.0)
    """
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        # Structure payload
        contents = [
            {"mime_type": mime_type, "data": image_bytes},
            prompt
        ]
        res = model.generate_content(contents)
        # Attempt to parse json from output
        text = res.text.strip()
        # Strip markdown code blocks if Gemini returns them
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        text_clean = text.strip()
        
        parsed = json.loads(text_clean)
        return parsed
    except Exception as e:
        logger.error(f"Gemini Vision proof validation failed: {str(e)}")
        # In case of API failure, log and return empty parse so rules engine falls back gracefully
        return {"steps": None, "distance_m": None, "duration_sec": None, "status": "failed", "error": str(e)}

async def generate_chat_response(messages: list, system_prompt: str) -> str:
    """Streams or generates conversation responses.
    Uses Groq (fast chat) as primary layer, failing over to Gemini if error occurs.
    """
    # Build unified conversation payload
    groq_messages = [{"role": "system", "content": system_prompt}] + messages
    
    # 1. Attempt Groq
    if groq_client:
        try:
            chat_completion = groq_client.chat.completions.create(
                messages=groq_messages,
                model="llama-3-70b-8192",
                temperature=0.7,
                max_tokens=500
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq API error, failing over to Gemini: {str(e)}")

    # 2. Fallback to Gemini
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
        try:
            model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=system_prompt)
            # Re-map role types from message list to match Gemini client expectations
            gemini_history = []
            for msg in messages[:-1]:
                role_map = "user" if msg["role"] == "user" else "model"
                gemini_history.append({"role": role_map, "parts": [msg["content"]]})
            
            chat = model.start_chat(history=gemini_history)
            res = chat.send_message(messages[-1]["content"])
            return res.text
        except Exception as e:
            logger.error(f"Gemini chat fallback failed: {str(e)}")

    # 3. Local Mock Fallback
    return "I'm currently running in local development mode without LLM API keys. You waka well well! Keep moving!"
