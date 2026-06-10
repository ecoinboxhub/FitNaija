import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.domains.auth.router import router as auth_router
from backend.app.domains.users.router import router as users_router
from backend.app.domains.challenges.router import router as challenges_router
from backend.app.domains.telemetry.router import router as telemetry_router
from backend.app.domains.payments.router import router as payments_router
from backend.app.domains.ai_agent.router import router as coach_router
from backend.app.domains.chat.router import router as chat_router
from backend.app.domains.notifications.router import router as notifications_router

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fitnaija.api")

# Initialize Firebase (non-blocking if not configured)
try:
    from backend.app.core.firebase import init_firebase
    init_firebase()
except Exception:
    pass

app = FastAPI(
    title="FitNaija API",
    description="Backend API services for the FitNaija Fitness Challenge App",
    version="4.0"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mount APIRouters
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(challenges_router, prefix="/api/v1")
app.include_router(telemetry_router, prefix="/api/v1")
app.include_router(payments_router, prefix="/api/v1")
app.include_router(coach_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(notifications_router, prefix="/api/v1")

# Global Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred."}
    )

@app.get("/")
async def root():
    return {
        "app": "FitNaija",
        "status": "healthy",
        "environment": settings.TARGET_ENV,
        "version": "4.0"
    }
