"""Load Statcast data from pybaseball into the database."""

import sys
sys.path.insert(0, "c:/Claude/Stats/backend")

from datetime import date, timedelta
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from pybaseball import statcast

from app.core.database import engine, SessionLocal
from app.models import Pitcher, Game, Pitch


def safe_float(val):
    """Safely convert to float, returning None for NaN/None."""
    if val is None or pd.isna(val):
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


def safe_int(val):
    """Safely convert to int, returning None for NaN/None."""
    if val is None or pd.isna(val):
        return None
    try:
        return int(val)
    except (ValueError, TypeError):
        return None


def safe_str(val):
    """Safely convert to string, returning None for NaN/None."""
    if val is None or pd.isna(val):
        return None
    return str(val) if val else None


def load_statcast_range(start_date: str, end_date: str, session: Session):
    """
    Load Statcast data for a date range.

    Args:
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
        session: Database session
    """
    print(f"Fetching Statcast data from {start_date} to {end_date}...")

    # Fetch data from pybaseball
    df = statcast(start_dt=start_date, end_dt=end_date)

    if df is None or df.empty:
        print("No data returned")
        return 0

    print(f"Got {len(df)} pitches")

    # Cache pitcher records: mlbam_id -> pitcher database ID
    pitcher_cache = {}
    games_added = set()
    pitches_added = 0

    # Pre-load existing pitchers into cache
    existing_pitchers = session.query(Pitcher).all()
    for p in existing_pitchers:
        pitcher_cache[p.mlbam_id] = p.id

    # Process each pitch
    for _, row in df.iterrows():
        # Add pitcher if not exists
        pitcher_mlbam = safe_int(row.get('pitcher'))
        if pitcher_mlbam and pitcher_mlbam not in pitcher_cache:
            pitcher = Pitcher(
                mlbam_id=pitcher_mlbam,
                name=safe_str(row.get('player_name')) or 'Unknown',
                throws=safe_str(row.get('p_throws')),
            )
            session.add(pitcher)
            session.flush()  # Get the ID immediately
            pitcher_cache[pitcher_mlbam] = pitcher.id

        # Add game if not exists
        game_pk = safe_int(row.get('game_pk'))
        if game_pk and game_pk not in games_added:
            existing = session.query(Game).filter_by(game_pk=game_pk).first()
            if not existing:
                game_date = pd.to_datetime(row.get('game_date')).date() if pd.notna(row.get('game_date')) else None
                game = Game(
                    game_pk=game_pk,
                    game_date=game_date,
                    game_year=safe_int(row.get('game_year')) or 2025,
                    game_type=safe_str(row.get('game_type')),
                    home_team=safe_str(row.get('home_team')),
                    away_team=safe_str(row.get('away_team')),
                )
                session.add(game)
                games_added.add(game_pk)

        # Get pitcher foreign key from cache
        pitcher_db_id = pitcher_cache.get(pitcher_mlbam) if pitcher_mlbam else None

        # Add pitch
        game_date = pd.to_datetime(row.get('game_date')).date() if pd.notna(row.get('game_date')) else None
        pitch = Pitch(
            pitcher_id=pitcher_db_id,
            game_pk=safe_int(game_pk),
            game_date=game_date,
            game_year=safe_int(row.get('game_year')) or 2025,
            pitch_type=safe_str(row.get('pitch_type')),
            pitch_name=safe_str(row.get('pitch_name')),
            pitcher_mlbam_id=safe_int(row.get('pitcher')),
            batter_mlbam_id=safe_int(row.get('batter')),
            batter_stand=safe_str(row.get('stand')),
            p_throws=safe_str(row.get('p_throws')),
            balls=safe_int(row.get('balls')),
            strikes=safe_int(row.get('strikes')),
            outs_when_up=safe_int(row.get('outs_when_up')),
            inning=safe_int(row.get('inning')),
            inning_topbot=safe_str(row.get('inning_topbot')),
            at_bat_number=safe_int(row.get('at_bat_number')),
            pitch_number=safe_int(row.get('pitch_number')),
            release_speed=safe_float(row.get('release_speed')),
            release_spin_rate=safe_float(row.get('release_spin_rate')),
            spin_axis=safe_float(row.get('spin_axis')),
            release_pos_x=safe_float(row.get('release_pos_x')),
            release_pos_y=safe_float(row.get('release_pos_y')),
            release_pos_z=safe_float(row.get('release_pos_z')),
            release_extension=safe_float(row.get('release_extension')),
            pfx_x=safe_float(row.get('pfx_x')),
            pfx_z=safe_float(row.get('pfx_z')),
            plate_x=safe_float(row.get('plate_x')),
            plate_z=safe_float(row.get('plate_z')),
            zone=safe_int(row.get('zone')),
            sz_top=safe_float(row.get('sz_top')),
            sz_bot=safe_float(row.get('sz_bot')),
            vx0=safe_float(row.get('vx0')),
            vy0=safe_float(row.get('vy0')),
            vz0=safe_float(row.get('vz0')),
            ax=safe_float(row.get('ax')),
            ay=safe_float(row.get('ay')),
            az=safe_float(row.get('az')),
            type=safe_str(row.get('type')),
            description=safe_str(row.get('description')),
            events=safe_str(row.get('events')),
            launch_speed=safe_float(row.get('launch_speed')),
            launch_angle=safe_float(row.get('launch_angle')),
            hit_distance_sc=safe_float(row.get('hit_distance_sc')),
            bb_type=safe_str(row.get('bb_type')),
            hc_x=safe_float(row.get('hc_x')),
            hc_y=safe_float(row.get('hc_y')),
            estimated_ba_using_speedangle=safe_float(row.get('estimated_ba_using_speedangle')),
            estimated_woba_using_speedangle=safe_float(row.get('estimated_woba_using_speedangle')),
            woba_value=safe_float(row.get('woba_value')),
            babip_value=safe_float(row.get('babip_value')),
            iso_value=safe_float(row.get('iso_value')),
            delta_run_exp=safe_float(row.get('delta_run_exp')),
        )
        session.add(pitch)
        pitches_added += 1

        # Commit in batches
        if pitches_added % 5000 == 0:
            session.commit()
            print(f"  Committed {pitches_added} pitches...")

    session.commit()
    print(f"Loaded {pitches_added} pitches, {len(pitcher_cache)} pitchers total, {len(games_added)} games")
    return pitches_added


def load_season(year: int):
    """Load an entire season of data."""
    session = SessionLocal()

    try:
        # MLB season roughly runs April-October
        start = f"{year}-03-20"  # Spring training / Opening Day
        end = f"{year}-11-05"    # After World Series

        # Load in monthly chunks to avoid memory issues
        current = date.fromisoformat(start)
        end_date = date.fromisoformat(end)

        total_pitches = 0
        while current < end_date:
            chunk_end = min(current + timedelta(days=7), end_date)
            pitches = load_statcast_range(
                current.isoformat(),
                chunk_end.isoformat(),
                session
            )
            total_pitches += pitches
            current = chunk_end + timedelta(days=1)

        print(f"\nTotal pitches loaded for {year}: {total_pitches}")

    finally:
        session.close()


def load_sample():
    """Load a small sample of recent data for testing."""
    session = SessionLocal()

    try:
        # Load last week of data for testing
        end = date.today()
        start = end - timedelta(days=7)

        load_statcast_range(start.isoformat(), end.isoformat(), session)

    finally:
        session.close()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Load Statcast data")
    parser.add_argument("--year", type=int, help="Load full year of data")
    parser.add_argument("--sample", action="store_true", help="Load sample data (last 7 days)")
    parser.add_argument("--start", type=str, help="Start date (YYYY-MM-DD)")
    parser.add_argument("--end", type=str, help="End date (YYYY-MM-DD)")

    args = parser.parse_args()

    if args.year:
        load_season(args.year)
    elif args.sample:
        load_sample()
    elif args.start and args.end:
        session = SessionLocal()
        try:
            load_statcast_range(args.start, args.end, session)
        finally:
            session.close()
    else:
        print("Usage:")
        print("  python load_statcast.py --year 2025    # Load full 2025 season")
        print("  python load_statcast.py --sample       # Load last 7 days")
        print("  python load_statcast.py --start 2025-04-01 --end 2025-04-07  # Load date range")
