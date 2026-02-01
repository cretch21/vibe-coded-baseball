from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Vibe-Coded Baseball API",
    description="MLB Pitch Analytics API powered by Statcast data",
    version="0.1.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
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
