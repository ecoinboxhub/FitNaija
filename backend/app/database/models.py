import uuid
from datetime import datetime, timedelta
from sqlalchemy import (
    Column, String, Integer, Numeric, Boolean, DateTime, ForeignKey, Enum, Index, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector
from backend.app.database.session import Base

# Target Location Taxonomy enum equivalent
LOCATION_TAXONOMY = (
    'maitama', 'wuse', 'garki', 'asokoro', 'apo', 
    'lokogoma', 'guzape', 'lugbe', 'kubwa', 
    'lagos', 'port_harcourt'
)

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone = Column(String(15), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=True)
    location = Column(String(50), nullable=False) # Maps to LOCATION_TAXONOMY
    status = Column(
        String(30), 
        default="trial_active",
        nullable=False,
        # trial_active, trial_expired, subscribed_active, subscription_expired
    )
    trial_start = Column(DateTime(timezone=True), default=datetime.utcnow)
    trial_end = Column(
        DateTime(timezone=True), 
        default=lambda: datetime.utcnow() + timedelta(days=30),
        nullable=False
    )
    bank_name = Column(String(100), nullable=True)
    bank_account_number = Column(String(20), nullable=True)
    bank_recipient_code = Column(String(100), nullable=True) # For manual reference
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(150), nullable=False)
    activity_type = Column(String(20), nullable=False, default="steps") # steps, running, cycling
    entry_fee = Column(Numeric(10, 2), nullable=False, default=0.00)
    prize_pool = Column(Numeric(10, 2), nullable=False, default=0.00)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    location_scope = Column(String(50), nullable=True) # Null corresponds to global challenge
    status = Column(
        String(20), 
        default="upcoming",
        nullable=False
        # upcoming, active, verification, settled
    )
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class ChallengeParticipant(Base):
    __tablename__ = "challenge_participants"

    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    total_steps = Column(Integer, default=0, nullable=False)
    fraud_status = Column(
        String(20), 
        default="clean", 
        nullable=False
        # clean, soft_flag, hard_flag, disqualified, cleared
    )
    joined_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False, index=True)
    steps = Column(Integer, default=0, nullable=False)
    distance_m = Column(Numeric(10, 2), default=0.00)
    duration_sec = Column(Integer, default=0)
    proof_image_url = Column(String(500), nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    fraud_score = Column(Numeric(5, 2), default=0.00)
    fraud_flags = Column(JSON, nullable=True) # JSON details of flags
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id", ondelete="SET NULL"), nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    transaction_type = Column(String(20), nullable=False) # subscription, entry_fee
    reference = Column(String(100), unique=True, nullable=False, index=True) # Paystack reference
    status = Column(String(20), nullable=False) # pending, success, failed
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class FitnessKnowledgeEmbedding(Base):
    __tablename__ = "fitness_knowledge_embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(String, nullable=False)
    metadata_json = Column(JSON, nullable=True)
    embedding = Column(Vector(1536)) # Cosine vector dimensions for text-embedding-3-small

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(10), nullable=False) # user, assistant, system
    content = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

# Indices for quick querying
Index("idx_activity_logs_search", ActivityLog.user_id, ActivityLog.challenge_id)
Index("idx_participants_search", ChallengeParticipant.challenge_id, ChallengeParticipant.user_id)
