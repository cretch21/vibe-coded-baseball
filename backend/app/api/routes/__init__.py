"""API route modules."""

from app.api.routes.pitchers import router as pitchers_router
from app.api.routes.leaderboards import router as leaderboards_router
from app.api.routes.discover import router as discover_router
from app.api.routes.stats import router as stats_router

__all__ = ["pitchers_router", "leaderboards_router", "discover_router", "stats_router"]
