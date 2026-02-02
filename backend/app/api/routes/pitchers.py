"""API routes for pitcher endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, distinct, case
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.pitcher import Pitcher
from app.models.pitch import Pitch
from app.schemas.pitcher import (
    PitcherResponse,
    PitcherSearchResult,
    PitcherDetailResponse,
    PitcherSeasonStats,
    PitchBase,
    PitchTypeStats,
    PaginatedResponse,
)

router = APIRouter(prefix="/pitchers", tags=["pitchers"])


@router.get("", response_model=PaginatedResponse)
async def list_pitchers(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    team: Optional[str] = Query(None, description="Filter by team abbreviation"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    is_starter: Optional[bool] = Query(None, description="Filter starters/relievers"),
    db: Session = Depends(get_db),
):
    """
    Get a paginated list of all pitchers.

    Use this endpoint to browse all pitchers in the database.
    Supports filtering by team, active status, and starter/reliever.
    """
    query = db.query(Pitcher)

    # Apply filters
    if team:
        query = query.filter(Pitcher.team == team.upper())
    if is_active is not None:
        query = query.filter(Pitcher.is_active == is_active)
    if is_starter is not None:
        query = query.filter(Pitcher.is_starter == is_starter)

    # Get total count
    total = query.count()

    # Paginate
    offset = (page - 1) * page_size
    pitchers = query.order_by(Pitcher.name).offset(offset).limit(page_size).all()

    return PaginatedResponse(
        items=[PitcherResponse.model_validate(p) for p in pitchers],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/search", response_model=list[PitcherSearchResult])
async def search_pitchers(
    q: str = Query(..., min_length=2, description="Search query (min 2 characters)"),
    limit: int = Query(10, ge=1, le=25, description="Max results to return"),
    db: Session = Depends(get_db),
):
    """
    Search pitchers by name for autocomplete.

    Returns a list of matching pitchers sorted by relevance.
    Matches all words in any order (so "robert stock" finds "Stock, Robert").
    """
    # Split query into words and require all words to match
    words = q.strip().split()

    query = db.query(Pitcher)

    # Each word must appear somewhere in the name
    for word in words:
        query = query.filter(Pitcher.name.ilike(f"%{word}%"))

    pitchers = query.order_by(Pitcher.name).limit(limit).all()

    return [PitcherSearchResult.model_validate(p) for p in pitchers]


@router.get("/{pitcher_id}", response_model=PitcherDetailResponse)
async def get_pitcher(
    pitcher_id: int,
    db: Session = Depends(get_db),
):
    """
    Get detailed information about a single pitcher.

    Returns pitcher metadata and a list of seasons with data.
    """
    pitcher = db.query(Pitcher).filter(Pitcher.id == pitcher_id).first()

    if not pitcher:
        raise HTTPException(status_code=404, detail="Pitcher not found")

    # Get list of seasons with data for this pitcher
    seasons = (
        db.query(distinct(Pitch.game_year))
        .filter(Pitch.pitcher_id == pitcher_id)
        .order_by(Pitch.game_year.desc())
        .all()
    )
    season_list = [s[0] for s in seasons]

    response = PitcherDetailResponse.model_validate(pitcher)
    response.seasons = season_list

    return response


@router.get("/{pitcher_id}/pitches", response_model=PaginatedResponse)
async def get_pitcher_pitches(
    pitcher_id: int,
    year: Optional[int] = Query(None, description="Filter by season year"),
    pitch_type: Optional[str] = Query(None, description="Filter by pitch type (FF, SL, etc.)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(100, ge=1, le=500, description="Items per page"),
    db: Session = Depends(get_db),
):
    """
    Get pitch-by-pitch data for a pitcher.

    Returns individual pitches with full Statcast data.
    Supports filtering by year and pitch type.
    """
    # Verify pitcher exists
    pitcher = db.query(Pitcher).filter(Pitcher.id == pitcher_id).first()
    if not pitcher:
        raise HTTPException(status_code=404, detail="Pitcher not found")

    query = db.query(Pitch).filter(Pitch.pitcher_id == pitcher_id)

    # Apply filters
    if year:
        query = query.filter(Pitch.game_year == year)
    if pitch_type:
        query = query.filter(Pitch.pitch_type == pitch_type.upper())

    # Get total count
    total = query.count()

    # Paginate (ordered by game date and pitch number)
    offset = (page - 1) * page_size
    pitches = (
        query.order_by(Pitch.game_date.desc(), Pitch.game_pk, Pitch.pitch_number)
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return PaginatedResponse(
        items=[PitchBase.model_validate(p) for p in pitches],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{pitcher_id}/stats", response_model=PitcherSeasonStats)
async def get_pitcher_stats(
    pitcher_id: int,
    year: Optional[int] = Query(None, description="Season year (defaults to most recent)"),
    db: Session = Depends(get_db),
):
    """
    Get aggregated statistics for a pitcher.

    Returns season totals, averages, and pitch arsenal breakdown.
    """
    # Verify pitcher exists
    pitcher = db.query(Pitcher).filter(Pitcher.id == pitcher_id).first()
    if not pitcher:
        raise HTTPException(status_code=404, detail="Pitcher not found")

    # If no year specified, get the most recent year with data
    if not year:
        most_recent = (
            db.query(func.max(Pitch.game_year))
            .filter(Pitch.pitcher_id == pitcher_id)
            .scalar()
        )
        if not most_recent:
            raise HTTPException(status_code=404, detail="No pitch data found for this pitcher")
        year = most_recent

    # Base query for this pitcher/year
    base_query = db.query(Pitch).filter(
        Pitch.pitcher_id == pitcher_id,
        Pitch.game_year == year,
    )

    total_pitches = base_query.count()
    if total_pitches == 0:
        raise HTTPException(status_code=404, detail=f"No pitch data found for year {year}")

    # Get overall stats
    overall_stats = db.query(
        func.count(Pitch.id).label("total"),
        func.count(distinct(Pitch.game_pk)).label("games"),
        func.avg(Pitch.release_speed).label("avg_velocity"),
        func.max(Pitch.release_speed).label("max_velocity"),
        func.sum(case((Pitch.type == "S", 1), else_=0)).label("strikes"),
        func.sum(case((Pitch.type == "B", 1), else_=0)).label("balls"),
        func.sum(case((Pitch.description.like("%swinging_strike%"), 1), else_=0)).label("whiffs"),
        func.sum(case((Pitch.type == "X", 1), else_=0)).label("in_play"),
    ).filter(
        Pitch.pitcher_id == pitcher_id,
        Pitch.game_year == year,
    ).first()

    # Calculate percentages
    total = overall_stats.total
    strike_pct = round((overall_stats.strikes / total) * 100, 1) if total > 0 else None
    ball_pct = round((overall_stats.balls / total) * 100, 1) if total > 0 else None
    whiff_pct = round((overall_stats.whiffs / total) * 100, 1) if total > 0 else None
    in_play_pct = round((overall_stats.in_play / total) * 100, 1) if total > 0 else None

    # Get pitch type breakdown
    pitch_types_query = db.query(
        Pitch.pitch_type,
        func.min(Pitch.pitch_name).label("pitch_name"),
        func.count(Pitch.id).label("count"),
        func.avg(Pitch.release_speed).label("avg_velocity"),
        func.min(Pitch.release_speed).label("min_velocity"),
        func.max(Pitch.release_speed).label("max_velocity"),
        func.avg(Pitch.release_spin_rate).label("avg_spin_rate"),
        func.avg(Pitch.pfx_x).label("avg_pfx_x"),
        func.avg(Pitch.pfx_z).label("avg_pfx_z"),
        func.sum(case((Pitch.description.like("%swinging_strike%"), 1), else_=0)).label("whiffs"),
        func.sum(case((Pitch.description == "called_strike", 1), else_=0)).label("called_strikes"),
        func.sum(case((Pitch.type == "B", 1), else_=0)).label("balls"),
        func.sum(case((Pitch.type == "X", 1), else_=0)).label("in_play"),
    ).filter(
        Pitch.pitcher_id == pitcher_id,
        Pitch.game_year == year,
        Pitch.pitch_type.isnot(None),
    ).group_by(Pitch.pitch_type).all()

    pitch_type_stats = []
    for pt in pitch_types_query:
        pt_count = pt.count
        pitch_type_stats.append(PitchTypeStats(
            pitch_type=pt.pitch_type,
            pitch_name=pt.pitch_name,
            count=pt_count,
            usage_pct=round((pt_count / total) * 100, 1) if total > 0 else 0,
            avg_velocity=round(pt.avg_velocity, 1) if pt.avg_velocity else None,
            min_velocity=round(pt.min_velocity, 1) if pt.min_velocity else None,
            max_velocity=round(pt.max_velocity, 1) if pt.max_velocity else None,
            avg_spin_rate=round(pt.avg_spin_rate) if pt.avg_spin_rate else None,
            avg_pfx_x=round(pt.avg_pfx_x, 1) if pt.avg_pfx_x else None,
            avg_pfx_z=round(pt.avg_pfx_z, 1) if pt.avg_pfx_z else None,
            whiff_pct=round((pt.whiffs / pt_count) * 100, 1) if pt_count > 0 else None,
            called_strike_pct=round((pt.called_strikes / pt_count) * 100, 1) if pt_count > 0 else None,
            ball_pct=round((pt.balls / pt_count) * 100, 1) if pt_count > 0 else None,
            in_play_pct=round((pt.in_play / pt_count) * 100, 1) if pt_count > 0 else None,
        ))

    # Sort by usage
    pitch_type_stats.sort(key=lambda x: x.usage_pct, reverse=True)

    return PitcherSeasonStats(
        year=year,
        total_pitches=total,
        games=overall_stats.games,
        avg_velocity=round(overall_stats.avg_velocity, 1) if overall_stats.avg_velocity else None,
        max_velocity=round(overall_stats.max_velocity, 1) if overall_stats.max_velocity else None,
        strike_pct=strike_pct,
        ball_pct=ball_pct,
        whiff_pct=whiff_pct,
        in_play_pct=in_play_pct,
        pitch_types=pitch_type_stats,
    )


@router.get("/{pitcher_id}/games")
async def get_pitcher_games(
    pitcher_id: int,
    year: Optional[int] = Query(None, description="Season year"),
    limit: int = Query(30, ge=1, le=50, description="Max games to return"),
    db: Session = Depends(get_db),
):
    """
    Get game log for a pitcher.

    Returns a list of games with pitch counts and basic stats.
    """
    # Verify pitcher exists
    pitcher = db.query(Pitcher).filter(Pitcher.id == pitcher_id).first()
    if not pitcher:
        raise HTTPException(status_code=404, detail="Pitcher not found")

    # Build query for games with pitch summaries
    query = db.query(
        Pitch.game_pk,
        Pitch.game_date,
        func.count(Pitch.id).label("total_pitches"),
        func.count(distinct(Pitch.inning)).label("innings_pitched"),
        func.avg(Pitch.release_speed).label("avg_velocity"),
        func.sum(case((Pitch.type == "S", 1), else_=0)).label("strikes"),
        func.sum(case((Pitch.description.like("%swinging_strike%"), 1), else_=0)).label("whiffs"),
        func.sum(case((Pitch.events == "strikeout", 1), else_=0)).label("strikeouts"),
        func.sum(case((Pitch.events == "walk", 1), else_=0)).label("walks"),
    ).filter(Pitch.pitcher_id == pitcher_id)

    if year:
        query = query.filter(Pitch.game_year == year)

    games = (
        query.group_by(Pitch.game_pk, Pitch.game_date)
        .order_by(Pitch.game_date.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "game_pk": g.game_pk,
            "date": g.game_date.isoformat(),
            "total_pitches": g.total_pitches,
            "innings_pitched": g.innings_pitched,
            "avg_velocity": round(g.avg_velocity, 1) if g.avg_velocity else None,
            "strikes": g.strikes,
            "whiffs": g.whiffs,
            "strikeouts": g.strikeouts,
            "walks": g.walks,
        }
        for g in games
    ]
