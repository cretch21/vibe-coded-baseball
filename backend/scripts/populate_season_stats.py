"""Populate SeasonStats table by aggregating data from pitches."""

import sys
sys.path.insert(0, "c:/Claude/Stats/backend")

from sqlalchemy import func, case, distinct
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models import Pitcher, Pitch
from app.models.season_stats import SeasonStats


def populate_season_stats(db: Session):
    """
    Aggregate pitch data into SeasonStats for each pitcher-year combination.

    This creates the data needed for the Discover page correlations.
    """
    print("Populating season stats from pitch data...")

    # Get all unique pitcher-year combinations
    pitcher_years = (
        db.query(Pitch.pitcher_id, Pitch.game_year)
        .filter(Pitch.pitcher_id.isnot(None))
        .distinct()
        .all()
    )

    print(f"Found {len(pitcher_years)} pitcher-year combinations")

    stats_created = 0
    stats_updated = 0

    for pitcher_id, year in pitcher_years:
        if pitcher_id is None or year is None:
            continue

        # Check if entry already exists
        existing = db.query(SeasonStats).filter_by(
            pitcher_id=pitcher_id, year=year
        ).first()

        # Query aggregated stats for this pitcher-year
        stats = db.query(
            func.count(Pitch.id).label("total_pitches"),
            func.count(distinct(Pitch.game_pk)).label("games"),
            # Velocity stats (fastballs only for avg, all for max)
            func.avg(
                case(
                    (Pitch.pitch_type.in_(["FF", "SI", "FC", "FT"]), Pitch.release_speed),
                    else_=None
                )
            ).label("avg_velocity"),
            func.max(Pitch.release_speed).label("max_velocity"),
            # Spin rate
            func.avg(Pitch.release_spin_rate).label("avg_spin_rate"),
            # Strike/ball percentages
            func.sum(case((Pitch.type == "S", 1), else_=0)).label("strikes"),
            func.sum(case((Pitch.type == "B", 1), else_=0)).label("balls"),
            # Whiff stats
            func.sum(case((Pitch.description.like("%swinging_strike%"), 1), else_=0)).label("whiffs"),
            func.sum(case((Pitch.description.in_(["swinging_strike", "swinging_strike_blocked", "foul_tip", "foul", "foul_bunt", "missed_bunt", "hit_into_play"]), 1), else_=0)).label("swings"),
            # Zone stats
            func.sum(case((Pitch.zone.in_([1,2,3,4,5,6,7,8,9]), 1), else_=0)).label("in_zone"),
            # Movement
            func.avg(
                case(
                    (Pitch.pitch_type.in_(["SL", "CU", "KC", "CB"]), Pitch.pfx_x),
                    else_=None
                )
            ).label("h_movement"),
            func.avg(
                case(
                    (Pitch.pitch_type.in_(["FF", "SI", "FC", "FT"]), Pitch.pfx_z),
                    else_=None
                )
            ).label("v_movement"),
            # First pitch strike (balls=0 and strikes=0 means first pitch)
            func.sum(case(((Pitch.balls == 0) & (Pitch.strikes == 0) & (Pitch.type == "S"), 1), else_=0)).label("first_strikes"),
            func.sum(case(((Pitch.balls == 0) & (Pitch.strikes == 0), 1), else_=0)).label("first_pitches"),
        ).filter(
            Pitch.pitcher_id == pitcher_id,
            Pitch.game_year == year
        ).first()

        if not stats or stats.total_pitches == 0:
            continue

        total = stats.total_pitches

        # Calculate derived percentages
        strike_pct = round((stats.strikes / total) * 100, 1) if total > 0 else None
        whiff_pct = round((stats.whiffs / stats.swings) * 100, 1) if stats.swings and stats.swings > 0 else None
        zone_pct = round((stats.in_zone / total) * 100, 1) if total > 0 else None
        first_strike_pct = round((stats.first_strikes / stats.first_pitches) * 100, 1) if stats.first_pitches and stats.first_pitches > 0 else None

        # Estimate innings pitched (roughly total_pitches / 15 per inning)
        innings_pitched = round(total / 15, 1)

        if existing:
            # Update existing record
            existing.total_pitches = total
            existing.games = stats.games
            existing.innings_pitched = innings_pitched
            existing.avg_velocity = round(stats.avg_velocity, 1) if stats.avg_velocity else None
            existing.max_velocity = round(stats.max_velocity, 1) if stats.max_velocity else None
            existing.avg_spin_rate = round(stats.avg_spin_rate) if stats.avg_spin_rate else None
            existing.whiff_pct = whiff_pct
            existing.strike_pct = strike_pct
            existing.zone_pct = zone_pct
            existing.h_movement = round(stats.h_movement, 2) if stats.h_movement else None
            existing.v_movement = round(stats.v_movement, 2) if stats.v_movement else None
            existing.first_strike_pct = first_strike_pct
            stats_updated += 1
        else:
            # Create new record
            season_stat = SeasonStats(
                pitcher_id=pitcher_id,
                year=year,
                total_pitches=total,
                games=stats.games,
                innings_pitched=innings_pitched,
                avg_velocity=round(stats.avg_velocity, 1) if stats.avg_velocity else None,
                max_velocity=round(stats.max_velocity, 1) if stats.max_velocity else None,
                avg_spin_rate=round(stats.avg_spin_rate) if stats.avg_spin_rate else None,
                whiff_pct=whiff_pct,
                strike_pct=strike_pct,
                zone_pct=zone_pct,
                h_movement=round(stats.h_movement, 2) if stats.h_movement else None,
                v_movement=round(stats.v_movement, 2) if stats.v_movement else None,
                first_strike_pct=first_strike_pct,
            )
            db.add(season_stat)
            stats_created += 1

        # Commit in batches
        if (stats_created + stats_updated) % 100 == 0:
            db.commit()
            print(f"  Processed {stats_created + stats_updated} pitcher-years...")

    db.commit()
    print(f"\nDone! Created {stats_created}, updated {stats_updated} season stat records.")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        populate_season_stats(db)
    finally:
        db.close()
