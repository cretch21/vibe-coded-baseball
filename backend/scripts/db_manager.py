"""Database manager - easy way to check status and load data."""

import sys
sys.path.insert(0, "c:/Claude/Stats/backend")

import argparse
from datetime import date
from app.core.database import SessionLocal
from app.models import Pitcher, Pitch, Game


def show_status():
    """Show current database statistics."""
    db = SessionLocal()
    try:
        pitcher_count = db.query(Pitcher).count()
        pitch_count = db.query(Pitch).count()
        game_count = db.query(Game).count()

        # Get date range of data
        from sqlalchemy import func
        min_date = db.query(func.min(Pitch.game_date)).scalar()
        max_date = db.query(func.max(Pitch.game_date)).scalar()

        print("\n" + "="*50)
        print("  BASEBALL DATABASE STATUS")
        print("="*50)
        print(f"\n  Pitchers:  {pitcher_count:,}")
        print(f"  Pitches:   {pitch_count:,}")
        print(f"  Games:     {game_count:,}")

        if min_date and max_date:
            print(f"\n  Date Range: {min_date} to {max_date}")
        else:
            print("\n  Date Range: No data loaded yet")

        print("\n" + "="*50)

        # Estimate database size
        db_size_mb = (pitch_count * 0.5) / 1024  # Rough estimate: 0.5KB per pitch
        print(f"  Estimated DB size: ~{db_size_mb:.1f} MB")
        print("="*50 + "\n")

    finally:
        db.close()


def load_data(start_date: str, end_date: str):
    """Load data for a date range."""
    from scripts.load_statcast import load_statcast_range

    print(f"\nLoading data from {start_date} to {end_date}...")
    print("This may take a while. Progress will be shown below.\n")

    db = SessionLocal()
    try:
        pitches = load_statcast_range(start_date, end_date, db)
        print(f"\nDone! Loaded {pitches:,} pitches.")
    finally:
        db.close()


def load_month(year: int, month: int):
    """Load a specific month of data."""
    from calendar import monthrange

    start = f"{year}-{month:02d}-01"
    last_day = monthrange(year, month)[1]
    end = f"{year}-{month:02d}-{last_day}"

    load_data(start, end)


def quick_menu():
    """Show interactive menu."""
    print("\n" + "="*50)
    print("  BASEBALL DATA MANAGER")
    print("="*50)
    print("\n  Commands:")
    print("    status    - Show database statistics")
    print("    load      - Load data (specify dates)")
    print("    april     - Load April 2025")
    print("    may       - Load May 2025")
    print("    june      - Load June 2025")
    print("    july      - Load July 2025")
    print("    august    - Load August 2025")
    print("    september - Load September 2025")
    print("    full      - Load full 2025 season (takes a while!)")
    print("    quit      - Exit")
    print("\n" + "="*50 + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Baseball Database Manager")
    parser.add_argument("command", nargs="?", default="menu",
                       help="Command: status, load, april, may, june, july, august, september, full")
    parser.add_argument("--start", type=str, help="Start date (YYYY-MM-DD)")
    parser.add_argument("--end", type=str, help="End date (YYYY-MM-DD)")

    args = parser.parse_args()

    if args.command == "menu":
        quick_menu()
        show_status()

    elif args.command == "status":
        show_status()

    elif args.command == "load":
        if args.start and args.end:
            load_data(args.start, args.end)
        else:
            print("Please specify --start and --end dates")
            print("Example: python db_manager.py load --start 2025-04-01 --end 2025-04-30")

    elif args.command == "april":
        load_month(2025, 4)
    elif args.command == "may":
        load_month(2025, 5)
    elif args.command == "june":
        load_month(2025, 6)
    elif args.command == "july":
        load_month(2025, 7)
    elif args.command == "august":
        load_month(2025, 8)
    elif args.command == "september":
        load_month(2025, 9)

    elif args.command == "full":
        print("\nLoading full 2025 season (April - October)...")
        print("This will take a while!\n")
        load_data("2025-04-01", "2025-10-31")

    else:
        print(f"Unknown command: {args.command}")
        quick_menu()
