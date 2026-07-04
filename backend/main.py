import sys
import io

# Fix Windows charmap encoding error — Gemini responses contain Unicode (emojis, etc.)
# that crash the process when stdout/stderr default to cp1252 on Windows.
if hasattr(sys.stdout, 'buffer') and (not sys.stdout.encoding or sys.stdout.encoding.lower() != 'utf-8'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'buffer') and (not sys.stderr.encoding or sys.stderr.encoding.lower() != 'utf-8'):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

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
    allow_origins=["*"],  # Update this in production
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
