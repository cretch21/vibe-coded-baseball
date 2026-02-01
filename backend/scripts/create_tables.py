"""Create database tables."""

import sys
sys.path.insert(0, "c:/Claude/Stats/backend")

from app.core.database import engine, Base
from app.models import Pitcher, Game, Pitch

def create_tables():
    """Create all database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Done! Tables created:")
    for table in Base.metadata.tables:
        print(f"  - {table}")

if __name__ == "__main__":
    create_tables()
