"""API routes for database statistics."""

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.pitcher import Pitcher
from app.models.pitch import Pitch
from app.models.game import Game

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/database")
async def get_database_stats(db: Session = Depends(get_db)):
    """
    Get overall database statistics for the dashboard.

    Returns counts of pitchers, pitches, games, and date range of data.
    """
    pitcher_count = db.query(func.count(Pitcher.id)).scalar() or 0
    pitch_count = db.query(func.count(Pitch.id)).scalar() or 0
    game_count = db.query(func.count(Game.id)).scalar() or 0

    # Get date range
    min_date = db.query(func.min(Pitch.game_date)).scalar()
    max_date = db.query(func.max(Pitch.game_date)).scalar()

    # Get years with data
    years = (
        db.query(Pitch.game_year)
        .distinct()
        .order_by(Pitch.game_year)
        .all()
    )
    year_list = [y[0] for y in years if y[0] is not None]

    return {
        "pitchers": pitcher_count,
        "pitches": pitch_count,
        "games": game_count,
        "min_date": min_date.isoformat() if min_date else None,
        "max_date": max_date.isoformat() if max_date else None,
        "years": year_list,
        "last_updated": max_date.isoformat() if max_date else None,
    }
