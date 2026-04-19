"""
Vintage Veda — FastAPI Backend Server
=============================================
Unified Python backend with MongoDB (Beanie ODM),
JWT authentication, and AI-powered VedaBot.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db

# Import all routers
from app.routers import auth, remedies, spices, bookmarks, dosha, content, admin, contact, chatbot


# ── App Lifespan: connect to MongoDB on startup ──
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database connection on startup, cleanup on shutdown."""
    client = await init_db()
    yield
    if client:
        client.close()
        print("🔌 MongoDB connection closed")


# ── Create FastAPI App ──
app = FastAPI(
    title="Vintage Veda API",
    description="Community-driven, AI-powered Ayurvedic Remedies Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS Middleware ──
origins = [
    settings.frontend_url,
    "http://localhost:5173",
    "http://localhost:3000",
]
# Add any Vercel/Netlify production domains
if settings.frontend_url not in origins:
    origins.append(settings.frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register Routers ──
app.include_router(auth.router)
app.include_router(remedies.router)
app.include_router(spices.router)
app.include_router(bookmarks.router)
app.include_router(dosha.router)
app.include_router(content.router)
app.include_router(admin.router)
app.include_router(contact.router)
app.include_router(chatbot.router)


# ── Health Check ──
@app.get("/", tags=["Health"])
async def root():
    from app.database import db_connected
    return {
        "app": settings.app_name,
        "status": "🌿 Healthy",
        "version": "1.0.0",
        "database": "connected" if db_connected else "demo_mode",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    from app.database import db_connected
    return {"status": "ok", "database": "connected" if db_connected else "demo_mode"}
