from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import pitchers_router, leaderboards_router, discover_router
from app.core.database import create_tables
# Import models to register them with SQLAlchemy
from app.models import Pitcher, Game, Pitch, SeasonStats  # noqa: F401

app = FastAPI(
    title="Vibe-Coded Baseball API",
    description="MLB Pitch Analytics API powered by Statcast data",
    version="0.1.0",
)

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    create_tables()

# CORS configuration - allow all origins for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=False,  # Must be False when using allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "vibe-coded-baseball-api"}


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Robert Stock's For Fun, Entirely Vibe-Coded Baseball API",
        "docs": "/docs",
        "health": "/health",
    }


# Include API routers
app.include_router(pitchers_router, prefix="/api")
app.include_router(leaderboards_router, prefix="/api")
app.include_router(discover_router, prefix="/api")
