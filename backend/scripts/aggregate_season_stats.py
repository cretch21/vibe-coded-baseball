"""Aggregate season-level statistics for correlation analysis.

This script combines:
1. Statcast-derived stats (aggregated from pitches table)
2. External stats from FanGraphs (via pybaseball)

Run this script after loading pitch data to populate the season_stats table.
"""

import sys
sys.path.insert(0, "c:/Claude/Stats/backend")

import pandas as pd
import numpy as np
from sqlalchemy import func, case, distinct
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, Base, engine
from app.models import Pitcher, Pitch
from app.models.season_stats import SeasonStats


def safe_float(val):
    """Safely convert to float, returning None for NaN/None."""
    if val is None or pd.isna(val):
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


def aggregate_statcast_stats(session: Session, year: int) -> dict:
    """
    Aggregate Statcast-derived stats from the pitches table.

    Returns a dictionary mapping pitcher_id to their stats.
    """
    print(f"  Aggregating Statcast stats for {year}...")

    # Define swing descriptions for whiff calculation
    swing_descriptions = [
        "swinging_strike", "swinging_strike_blocked",
        "foul", "foul_tip", "foul_bunt", "hit_into_play"
    ]
    whiff_descriptions = ["swinging_strike", "swinging_strike_blocked"]

    # Query aggregated stats per pitcher
    results = (
        session.query(
            Pitch.pitcher_id,
            func.count(Pitch.id).label("total_pitches"),
            func.count(distinct(Pitch.game_pk)).label("games"),

            # Velocity (fastballs only: FF, SI, FC, FT)
            func.avg(
                case((Pitch.pitch_type.in_(["FF", "SI", "FC", "FT"]), Pitch.release_speed))
            ).label("avg_velocity"),
            func.max(Pitch.release_speed).label("max_velocity"),

            # Spin rate (all pitches)
            func.avg(Pitch.release_spin_rate).label("avg_spin_rate"),

            # Whiff % = swinging strikes / swings
            (
                func.sum(case((Pitch.description.in_(whiff_descriptions), 1), else_=0)) * 100.0 /
                func.nullif(func.sum(case((Pitch.description.in_(swing_descriptions), 1), else_=0)), 0)
            ).label("whiff_pct"),

            # Strike % = strikes / total
            (
                func.sum(case((Pitch.type == "S", 1), else_=0)) * 100.0 /
                func.nullif(func.count(Pitch.id), 0)
            ).label("strike_pct"),

            # Zone % = pitches in zone / total (zone 1-9 are in strike zone)
            (
                func.sum(case((Pitch.zone.between(1, 9), 1), else_=0)) * 100.0 /
                func.nullif(func.count(Pitch.id), 0)
            ).label("zone_pct"),

            # Chase % = swings outside zone / pitches outside zone
            (
                func.sum(case(
                    (Pitch.zone.in_([11, 12, 13, 14]) & Pitch.description.in_(swing_descriptions), 1),
                    else_=0
                )) * 100.0 /
                func.nullif(func.sum(case((Pitch.zone.in_([11, 12, 13, 14]), 1), else_=0)), 0)
            ).label("chase_pct"),

            # Horizontal movement (breaking balls: SL, CU, KC, SV)
            func.avg(
                case((Pitch.pitch_type.in_(["SL", "CU", "KC", "SV"]), func.abs(Pitch.pfx_x)))
            ).label("h_movement"),

            # Vertical movement (fastballs: FF, SI, FC, FT)
            func.avg(
                case((Pitch.pitch_type.in_(["FF", "SI", "FC", "FT"]), Pitch.pfx_z))
            ).label("v_movement"),

            # First pitch strike % (strikes on 0-0 count)
            (
                func.sum(case(
                    ((Pitch.balls == 0) & (Pitch.strikes == 0) & (Pitch.type == "S"), 1),
                    else_=0
                )) * 100.0 /
                func.nullif(func.sum(case(
                    ((Pitch.balls == 0) & (Pitch.strikes == 0), 1),
                    else_=0
                )), 0)
            ).label("first_strike_pct"),
        )
        .filter(Pitch.game_year == year)
        .filter(Pitch.pitcher_id.isnot(None))
        .group_by(Pitch.pitcher_id)
        .all()
    )

    # Convert to dictionary
    stats_by_pitcher = {}
    for row in results:
        stats_by_pitcher[row.pitcher_id] = {
            "total_pitches": row.total_pitches,
            "games": row.games,
            "avg_velocity": safe_float(row.avg_velocity),
            "max_velocity": safe_float(row.max_velocity),
            "avg_spin_rate": safe_float(row.avg_spin_rate),
            "whiff_pct": safe_float(row.whiff_pct),
            "strike_pct": safe_float(row.strike_pct),
            "zone_pct": safe_float(row.zone_pct),
            "chase_pct": safe_float(row.chase_pct),
            "h_movement": safe_float(row.h_movement),
            "v_movement": safe_float(row.v_movement),
            "first_strike_pct": safe_float(row.first_strike_pct),
        }

    print(f"    Found {len(stats_by_pitcher)} pitchers with Statcast data")
    return stats_by_pitcher


def fetch_fangraphs_stats(year: int) -> dict:
    """
    Fetch FanGraphs pitching stats via pybaseball.

    Returns a dictionary mapping MLBAM ID to their stats.
    """
    print(f"  Fetching FanGraphs stats for {year}...")

    try:
        from pybaseball import pitching_stats

        # Fetch stats for pitchers with at least 20 IP
        df = pitching_stats(year, qual=20)

        if df is None or df.empty:
            print("    No FanGraphs data returned")
            return {}

        print(f"    Got {len(df)} pitchers from FanGraphs")

        # pybaseball uses 'IDfg' for FanGraphs ID and 'key_mlbam' for MLBAM ID
        # We need to check which ID columns are available
        stats_by_mlbam = {}

        for _, row in df.iterrows():
            # Try to get MLBAM ID - column name varies
            mlbam_id = None
            for col in ['key_mlbam', 'MLBAMID', 'mlbam_id', 'playerid']:
                if col in df.columns and pd.notna(row.get(col)):
                    mlbam_id = int(row.get(col))
                    break

            if mlbam_id is None:
                continue

            stats_by_mlbam[mlbam_id] = {
                "innings_pitched": safe_float(row.get('IP')),
                "era": safe_float(row.get('ERA')),
                "fip": safe_float(row.get('FIP')),
                "xfip": safe_float(row.get('xFIP')),
                "siera": safe_float(row.get('SIERA')),
                "whip": safe_float(row.get('WHIP')),
                "k_per_9": safe_float(row.get('K/9')),
                "bb_per_9": safe_float(row.get('BB/9')),
                "hr_per_9": safe_float(row.get('HR/9')),
                "war": safe_float(row.get('WAR')),
                "gb_pct": safe_float(row.get('GB%')),
                "fb_pct": safe_float(row.get('FB%')),
                "ld_pct": safe_float(row.get('LD%')),
                "hard_hit_pct": safe_float(row.get('Hard%')),
                "barrel_pct": safe_float(row.get('Barrel%')),
            }

        print(f"    Matched {len(stats_by_mlbam)} pitchers by MLBAM ID")
        return stats_by_mlbam

    except Exception as e:
        print(f"    Error fetching FanGraphs data: {e}")
        return {}


def aggregate_year(session: Session, year: int):
    """Aggregate stats for a single year."""
    print(f"\nProcessing {year}...")

    # Get Statcast stats
    statcast_stats = aggregate_statcast_stats(session, year)

    # Get FanGraphs stats
    fangraphs_stats = fetch_fangraphs_stats(year)

    # Get pitcher MLBAM IDs for matching
    pitchers = {p.id: p.mlbam_id for p in session.query(Pitcher).all()}

    # Combine and store
    added = 0
    updated = 0

    for pitcher_id, sc_stats in statcast_stats.items():
        mlbam_id = pitchers.get(pitcher_id)
        fg_stats = fangraphs_stats.get(mlbam_id, {}) if mlbam_id else {}

        # Check if record exists
        existing = (
            session.query(SeasonStats)
            .filter_by(pitcher_id=pitcher_id, year=year)
            .first()
        )

        if existing:
            # Update existing record
            for key, value in sc_stats.items():
                setattr(existing, key, value)
            for key, value in fg_stats.items():
                setattr(existing, key, value)
            updated += 1
        else:
            # Create new record
            season_stat = SeasonStats(
                pitcher_id=pitcher_id,
                year=year,
                **sc_stats,
                **fg_stats,
            )
            session.add(season_stat)
            added += 1

    session.commit()
    print(f"  Added {added}, updated {updated} records")


def aggregate_all_years(session: Session, start_year: int = 2015, end_year: int = 2024):
    """Aggregate stats for all years in range."""
    print(f"Aggregating season stats from {start_year} to {end_year}...")

    # Ensure table exists
    Base.metadata.create_all(engine)

    for year in range(start_year, end_year + 1):
        aggregate_year(session, year)

    print("\nDone!")


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Aggregate season stats")
    parser.add_argument("--year", type=int, help="Aggregate single year")
    parser.add_argument("--all", action="store_true", help="Aggregate all years (2015-2024)")
    parser.add_argument("--start", type=int, default=2015, help="Start year (default: 2015)")
    parser.add_argument("--end", type=int, default=2024, help="End year (default: 2024)")

    args = parser.parse_args()

    session = SessionLocal()

    try:
        # Ensure table exists
        Base.metadata.create_all(engine)

        if args.year:
            aggregate_year(session, args.year)
        elif args.all:
            aggregate_all_years(session, args.start, args.end)
        else:
            print("Usage:")
            print("  python aggregate_season_stats.py --year 2024       # Single year")
            print("  python aggregate_season_stats.py --all             # All years 2015-2024")
            print("  python aggregate_season_stats.py --all --start 2020 --end 2024  # Custom range")
    finally:
        session.close()


if __name__ == "__main__":
    main()
