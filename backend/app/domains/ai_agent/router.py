from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
import google.generativeai as genai

from backend.app.database.session import get_db
from backend.app.database.models import ChatMessage, FitnessKnowledgeEmbedding, User, ChallengeParticipant
from backend.app.domains.auth.deps import get_current_user
from backend.app.core.config import settings
from backend.app.core.ai_router import generate_chat_response

router = APIRouter(prefix="/coach", tags=["AI Coach & Support Agent"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

async def get_text_embedding(text: str) -> List[float]:
    """Generate text embedding using Google Gemini Embeddings API."""
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "your_gemini_api_key_here":
        # Dev fallback: returns a dummy 1536 float list
        return [0.0] * 1536
    
    try:
        res = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_query"
        )
        # Returns list of floats matching dimensions (standard is 768 or 1536 depending on settings)
        # Gemini text-embedding-004 dimensions default to 768, we map pgvector to the same or pad to 1536
        emb = res.get("embedding", [0.0] * 768)
        # Pad to 1536 dimensions if necessary
        if len(emb) < 1536:
            emb = emb + [0.0] * (1536 - len(emb))
        return emb[:1536]
    except Exception:
        return [0.0] * 1536

@router.post("/chat", response_model=ChatResponse)
async def chat_with_coach(
    payload: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_msg_str = payload.message.strip()
    if not user_msg_str:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message cannot be empty")

    # 1. Fetch user's active challenge flags to see if they are in dispute
    part_query = select(ChallengeParticipant).filter(
        ChallengeParticipant.user_id == user.id,
        ChallengeParticipant.fraud_status == "hard_flag"
    )
    flagged_participant = (await db.execute(part_query)).scalars().first()
    in_dispute = flagged_participant is not None

    # 2. RAG Semantic Lookup on pgvector Knowledges
    query_vector = await get_text_embedding(user_msg_str)
    
    # Run cosine distance query
    rag_context = ""
    try:
        # Cosine distance operator is <=> in pgvector, mapped as cosine_distance in pgvector-python
        rag_query = select(FitnessKnowledgeEmbedding).order_by(
            FitnessKnowledgeEmbedding.embedding.cosine_distance(query_vector)
        ).limit(3)
        rag_rows = (await db.execute(rag_query)).scalars().all()
        if rag_rows:
            rag_context = "\n".join([row.content for row in rag_rows])
    except Exception:
        # Fallback if pgvector is not initialized or database has no rows
        rag_context = "FitNaija rules: Users pay ₦15,000/month. Payouts are manual. Location enums are active in Abuja."

    # 3. Load Short-Term Conversation History (Last 10 turns)
    history_query = select(ChatMessage).filter(
        ChatMessage.user_id == user.id
    ).order_by(ChatMessage.created_at.desc()).limit(10)
    history_rows = (await db.execute(history_query)).scalars().all()
    history_rows.reverse() # Reorder to chronological

    messages_payload = []
    for msg in history_rows:
        messages_payload.append({"role": msg.role, "content": msg.content})
    messages_payload.append({"role": "user", "content": user_msg_str})

    # 4. Construct System Prompt
    system_instruction = f"""
    You are the FitNaija AI Companion, a fitness coach and support assistant for professionals in Abuja, Lagos, and Port Harcourt.
    
    User Context:
    * Display Name: {user.display_name or 'Runner'}
    * Neighborhood/Location: {user.location.title()}
    * Subscription Status: {user.status.title()}
    * Dispute Flag Status: {'FLAGGED / UNDER REVIEW' if in_dispute else 'CLEAN'}
    
    RAG Context (Challenge rules and Abuja trail guidelines):
    {rag_context}
    
    Operational Guidelines:
    * If the user is FLAGGED/UNDER REVIEW and asks about locked progress, act as the AI Dispute Assistant. Explain that their telemetry triggered our cheat prevention rules (e.g. speed spikes, CADENCE variance). Gather their reasons (e.g. if they rode an Okada or bus) and record their appeal. Maintain a polite but firm, objective tone.
    * If the user is CLEAN, act as the AI Coach. Motivate them, suggest neighborhood routes, and help them strategize to win challenges.
    * FitNaija charges ₦15,000/month after a 1-month trial. Challenge payouts are processed manually by admins.
    """

    # 5. Invoke Multi-Model Router
    agent_reply = await generate_chat_response(messages_payload, system_instruction)

    # 6. Persist Chat messages (User and Assistant replies)
    user_msg = ChatMessage(user_id=user.id, role="user", content=user_msg_str)
    assistant_msg = ChatMessage(user_id=user.id, role="assistant", content=agent_reply)
    db.add(user_msg)
    db.add(assistant_msg)
    await db.commit()

    return {"response": agent_reply}
