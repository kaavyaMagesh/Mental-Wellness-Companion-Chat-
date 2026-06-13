from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import sessions, messages

app = FastAPI(
    title="InnerWhispers API",
    description="Backend API for InnerWhispers AI Wellness Companion",
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(sessions.router, prefix="/api/chat", tags=["Chat Sessions"])
app.include_router(messages.router, prefix="/api/chat", tags=["Chat Messages"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "innerwhispers-backend"}
