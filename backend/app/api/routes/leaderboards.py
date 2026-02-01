"""API routes for leaderboard endpoints."""

from typing import Optional, Literal
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, case, distinct
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.pitcher import Pitcher
from app.models.pitch import Pitch
from app.schemas.leaderboard import LeaderboardEntry, LeaderboardResponse

router = APIRouter(prefix="/leaderboards", tags=["leaderboards"])

# Define the stat categories and their configurations
STAT_CONFIGS = {
    "velocity": {
        "name": "Avg Fastball Velocity",
        "description": "Average velocity on fastballs (4-seam, 2-seam, sinker, cutter)",
        "unit": "mph",
        "order": "desc",
        "pitch_types": ["FF", "FT", "SI", "FC"],
    },
    "max_velocity": {
        "name": "Max Velocity",
        "description": "Maximum pitch velocity recorded",
        "unit": "mph",
        "order": "desc",
        "pitch_types": None,  # All pitches
    },
    "spin_rate": {
        "name": "Avg Spin Rate",
        "description": "Average spin rate across all pitches",
        "unit": "rpm",
        "order": "desc",
        "pitch_types": None,
    },
    "whiff_pct": {
        "name": "Whiff %",
        "description": "Swinging strike rate (swinging strikes / total swings)",
        "unit": "%",
        "order": "desc",
        "pitch_types": None,
    },
    "strikeout_pct": {
        "name": "K %",
        "description": "Strikeout rate per plate appearance",
        "unit": "%",
        "order": "desc",
        "pitch_types": None,
    },
    "h_movement": {
        "name": "Horizontal Movement",
        "description": "Average horizontal break on breaking balls (slider, curveball)",
        "unit": "in",
        "order": "desc",
        "pitch_types": ["SL", "CU", "KC", "SV"],
    },
    "v_movement": {
        "name": "Vertical Movement",
        "description": "Average vertical rise on fastballs",
        "unit": "in",
        "order": "desc",
        "pitch_types": ["FF", "FT", "SI", "FC"],
    },
    "strike_pct": {
        "name": "Strike %",
        "description": "Percentage of pitches in the strike zone",
        "unit": "%",
        "order": "desc",
        "pitch_types": None,
    },
}


@router.get("", response_model=LeaderboardResponse)
async def get_leaderboard(
    stat: Literal[
        "velocity", "max_velocity", "spin_rate", "whiff_pct",
        "strikeout_pct", "h_movement", "v_movement", "strike_pct"
    ] = Query("velocity", description="Statistic to rank by"),
    year: Optional[int] = Query(None, description="Season year (defaults to most recent)"),
    limit: int = Query(25, ge=10, le=50, description="Number of results (10, 25, or 50)"),
    is_starter: Optional[bool] = Query(None, description="Filter by starter (true) or reliever (false)"),
    min_pitches: int = Query(500, ge=100, le=2000, description="Minimum pitch count to qualify"),
    db: Session = Depends(get_db),
):
    """
    Get leaderboard rankings for a specific statistic.

    Returns pitchers ranked by the selected stat with optional filters
    for starter/reliever and minimum pitch count.
    """
    # If no year specified, get the most recent year with data
    if not year:
        most_recent = db.query(func.max(Pitch.game_year)).scalar()
        if not most_recent:
            return LeaderboardResponse(
                stat=stat,
                stat_name=STAT_CONFIGS[stat]["name"],
                stat_description=STAT_CONFIGS[stat]["description"],
                unit=STAT_CONFIGS[stat]["unit"],
                year=0,
                entries=[],
            )
        year = most_recent

    config = STAT_CONFIGS[stat]

    # Build base query for aggregated stats per pitcher
    base_filters = [Pitch.game_year == year]

    # Filter by pitch types if needed
    if config["pitch_types"]:
        base_filters.append(Pitch.pitch_type.in_(config["pitch_types"]))

    # Build the aggregation query based on the stat
    if stat == "velocity":
        stat_expr = func.avg(Pitch.release_speed)
    elif stat == "max_velocity":
        stat_expr = func.max(Pitch.release_speed)
    elif stat == "spin_rate":
        stat_expr = func.avg(Pitch.release_spin_rate)
    elif stat == "whiff_pct":
        # Whiff % = swinging strikes / total swings (not total pitches)
        swings = func.sum(case(
            (Pitch.description.in_([
                "swinging_strike", "swinging_strike_blocked",
                "foul", "foul_tip", "foul_bunt", "hit_into_play"
            ]), 1),
            else_=0
        ))
        whiffs = func.sum(case(
            (Pitch.description.in_(["swinging_strike", "swinging_strike_blocked"]), 1),
            else_=0
        ))
        stat_expr = (whiffs * 100.0) / func.nullif(swings, 0)
    elif stat == "strikeout_pct":
        # K% = strikeouts / plate appearances (approximated by at-bat endings)
        strikeouts = func.sum(case((Pitch.events == "strikeout", 1), else_=0))
        pas = func.count(distinct(
            func.concat(Pitch.game_pk, "_", Pitch.at_bat_number)
        ))
        stat_expr = (strikeouts * 100.0) / func.nullif(pas, 0)
    elif stat == "h_movement":
        stat_expr = func.abs(func.avg(Pitch.pfx_x))
    elif stat == "v_movement":
        stat_expr = func.avg(Pitch.pfx_z)
    elif stat == "strike_pct":
        strikes = func.sum(case((Pitch.type == "S", 1), else_=0))
        total = func.count(Pitch.id)
        stat_expr = (strikes * 100.0) / func.nullif(total, 0)
    else:
        stat_expr = func.avg(Pitch.release_speed)

    # Main query joining pitches with pitchers
    query = (
        db.query(
            Pitcher.id,
            Pitcher.name,
            Pitcher.team,
            Pitcher.is_starter,
            func.count(Pitch.id).label("pitch_count"),
            func.count(distinct(Pitch.game_pk)).label("games"),
            stat_expr.label("stat_value"),
        )
        .join(Pitch, Pitch.pitcher_id == Pitcher.id)
        .filter(*base_filters)
        .group_by(Pitcher.id, Pitcher.name, Pitcher.team, Pitcher.is_starter)
        .having(func.count(Pitch.id) >= min_pitches)
    )

    # Apply starter/reliever filter
    if is_starter is not None:
        query = query.filter(Pitcher.is_starter == is_starter)

    # Order by stat value
    if config["order"] == "desc":
        query = query.order_by(stat_expr.desc().nullslast())
    else:
        query = query.order_by(stat_expr.asc().nullsfirst())

    # Limit results
    results = query.limit(limit).all()

    # Build response
    entries = []
    for rank, row in enumerate(results, start=1):
        value = row.stat_value
        if value is not None:
            # Round appropriately based on stat type
            if stat in ["velocity", "max_velocity", "h_movement", "v_movement"]:
                value = round(value, 1)
            elif stat == "spin_rate":
                value = round(value)
            else:
                value = round(value, 1)

        entries.append(LeaderboardEntry(
            rank=rank,
            pitcher_id=row.id,
            name=row.name,
            team=row.team,
            is_starter=row.is_starter,
            value=value,
            games=row.games,
            pitch_count=row.pitch_count,
        ))

    return LeaderboardResponse(
        stat=stat,
        stat_name=config["name"],
        stat_description=config["description"],
        unit=config["unit"],
        year=year,
        min_pitches=min_pitches,
        is_starter=is_starter,
        entries=entries,
    )


@router.get("/stats")
async def get_available_stats():
    """
    Get list of available statistics for leaderboards.

    Returns metadata about each stat that can be used for the leaderboard.
    """
    return [
        {
            "id": stat_id,
            "name": config["name"],
            "description": config["description"],
            "unit": config["unit"],
        }
        for stat_id, config in STAT_CONFIGS.items()
    ]
