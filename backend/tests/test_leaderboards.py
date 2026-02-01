"""Tests for leaderboard endpoints using SQLite and mock data."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import date

from app.main import app
from app.core.database import Base, get_db
from app.models.pitcher import Pitcher
from app.models.pitch import Pitch


@pytest.fixture(scope="function")
def client():
    """Create test client with mock data."""
    # Create SQLite test database
    SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    # Create tables
    Base.metadata.create_all(bind=engine)

    # Add mock data
    db = TestingSessionLocal()

    # Create test pitchers
    pitchers = [
        Pitcher(id=1, mlbam_id=123456, name="Flamethrower Jones", team="NYY", throws="R", is_starter=True, is_active=True),
        Pitcher(id=2, mlbam_id=234567, name="Spin Master Smith", team="LAD", throws="L", is_starter=True, is_active=True),
        Pitcher(id=3, mlbam_id=345678, name="Whiff King Williams", team="HOU", throws="R", is_starter=False, is_active=True),
        Pitcher(id=4, mlbam_id=456789, name="Control Artist Davis", team="ATL", throws="R", is_starter=True, is_active=True),
        Pitcher(id=5, mlbam_id=567890, name="Slider Steve", team="SD", throws="L", is_starter=False, is_active=True),
    ]

    for p in pitchers:
        db.add(p)
    db.commit()

    # Create test pitches for each pitcher
    pitch_data = [
        # Pitcher 1: High velocity fastballs
        {"pitcher_id": 1, "pitch_type": "FF", "release_speed": 99.5, "release_spin_rate": 2400, "pfx_x": 8.0, "pfx_z": 14.0, "type": "S", "description": "called_strike"},
        {"pitcher_id": 1, "pitch_type": "FF", "release_speed": 100.2, "release_spin_rate": 2450, "pfx_x": 7.5, "pfx_z": 13.5, "type": "S", "description": "swinging_strike"},
        {"pitcher_id": 1, "pitch_type": "FF", "release_speed": 99.8, "release_spin_rate": 2380, "pfx_x": 8.2, "pfx_z": 14.2, "type": "B", "description": "ball"},
        # Pitcher 2: High spin rate
        {"pitcher_id": 2, "pitch_type": "FF", "release_speed": 94.5, "release_spin_rate": 2650, "pfx_x": 10.0, "pfx_z": 16.0, "type": "S", "description": "called_strike"},
        {"pitcher_id": 2, "pitch_type": "CU", "release_speed": 78.0, "release_spin_rate": 2800, "pfx_x": -6.0, "pfx_z": -8.0, "type": "S", "description": "swinging_strike"},
        {"pitcher_id": 2, "pitch_type": "SL", "release_speed": 85.0, "release_spin_rate": 2700, "pfx_x": -4.0, "pfx_z": 2.0, "type": "S", "description": "swinging_strike"},
        # Pitcher 3: High whiff rate (reliever)
        {"pitcher_id": 3, "pitch_type": "SL", "release_speed": 88.0, "release_spin_rate": 2500, "pfx_x": -8.0, "pfx_z": 1.0, "type": "S", "description": "swinging_strike"},
        {"pitcher_id": 3, "pitch_type": "SL", "release_speed": 87.5, "release_spin_rate": 2480, "pfx_x": -7.5, "pfx_z": 0.5, "type": "S", "description": "swinging_strike"},
        {"pitcher_id": 3, "pitch_type": "FF", "release_speed": 96.0, "release_spin_rate": 2300, "pfx_x": 6.0, "pfx_z": 12.0, "type": "S", "description": "foul"},
        # Pitcher 4: Good control (high strike %)
        {"pitcher_id": 4, "pitch_type": "FF", "release_speed": 93.0, "release_spin_rate": 2200, "pfx_x": 7.0, "pfx_z": 13.0, "type": "S", "description": "called_strike"},
        {"pitcher_id": 4, "pitch_type": "SI", "release_speed": 92.0, "release_spin_rate": 2100, "pfx_x": 12.0, "pfx_z": 8.0, "type": "S", "description": "called_strike"},
        {"pitcher_id": 4, "pitch_type": "CH", "release_speed": 84.0, "release_spin_rate": 1800, "pfx_x": 14.0, "pfx_z": 4.0, "type": "S", "description": "called_strike"},
        # Pitcher 5: Big slider movement (reliever)
        {"pitcher_id": 5, "pitch_type": "SL", "release_speed": 82.0, "release_spin_rate": 2600, "pfx_x": -12.0, "pfx_z": -2.0, "type": "S", "description": "swinging_strike"},
        {"pitcher_id": 5, "pitch_type": "SL", "release_speed": 83.0, "release_spin_rate": 2650, "pfx_x": -11.5, "pfx_z": -1.5, "type": "S", "description": "swinging_strike"},
        {"pitcher_id": 5, "pitch_type": "CU", "release_speed": 75.0, "release_spin_rate": 2900, "pfx_x": -8.0, "pfx_z": -10.0, "type": "B", "description": "ball"},
    ]

    # Add more pitches to meet minimum pitch count (500 default, use lower min for tests)
    for i in range(100):
        for pitcher_id in [1, 2, 3, 4, 5]:
            base = pitch_data[(pitcher_id - 1) * 3]  # Use first pitch as template
            pitch = Pitch(
                pitcher_id=pitcher_id,
                game_pk=1000 + i,
                game_date=date(2024, 6, 1),
                game_year=2024,
                pitch_type=base["pitch_type"],
                pitch_name="4-Seam Fastball" if base["pitch_type"] == "FF" else "Slider",
                release_speed=base["release_speed"] + (i % 5) * 0.1,
                release_spin_rate=base["release_spin_rate"],
                pfx_x=base["pfx_x"],
                pfx_z=base["pfx_z"],
                type=base["type"],
                description=base["description"],
                at_bat_number=i + 1,
                pitch_number=1,
            )
            db.add(pitch)

    db.commit()
    db.close()

    yield TestClient(app)

    # Cleanup
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


class TestLeaderboardStats:
    """Test /api/leaderboards/stats endpoint."""

    def test_get_available_stats(self, client):
        """Should return list of available statistics."""
        response = client.get("/api/leaderboards/stats")
        assert response.status_code == 200

        stats = response.json()
        assert isinstance(stats, list)
        assert len(stats) == 8  # 8 stat types defined

        # Check structure of first stat
        stat = stats[0]
        assert "id" in stat
        assert "name" in stat
        assert "description" in stat
        assert "unit" in stat

    def test_stats_include_expected_categories(self, client):
        """Should include all expected stat categories."""
        response = client.get("/api/leaderboards/stats")
        stats = response.json()

        stat_ids = [s["id"] for s in stats]
        expected = ["velocity", "max_velocity", "spin_rate", "whiff_pct",
                    "strikeout_pct", "h_movement", "v_movement", "strike_pct"]

        for exp in expected:
            assert exp in stat_ids, f"Missing stat: {exp}"


class TestLeaderboardRankings:
    """Test /api/leaderboards endpoint."""

    def test_get_velocity_leaderboard(self, client):
        """Should return velocity rankings."""
        response = client.get("/api/leaderboards?stat=velocity&limit=10&min_pitches=100")
        assert response.status_code == 200

        data = response.json()
        assert data["stat"] == "velocity"
        assert data["stat_name"] == "Avg Fastball Velocity"
        assert data["unit"] == "mph"
        assert data["year"] == 2024
        assert len(data["entries"]) > 0

        # Check rankings are in order (highest first)
        entries = data["entries"]
        for i in range(len(entries) - 1):
            assert entries[i]["value"] >= entries[i + 1]["value"]

    def test_get_spin_rate_leaderboard(self, client):
        """Should return spin rate rankings."""
        response = client.get("/api/leaderboards?stat=spin_rate&limit=10&min_pitches=100")
        assert response.status_code == 200

        data = response.json()
        assert data["stat"] == "spin_rate"
        assert data["unit"] == "rpm"

    def test_filter_by_starters(self, client):
        """Should filter to only starters."""
        response = client.get("/api/leaderboards?stat=velocity&is_starter=true&min_pitches=100")
        assert response.status_code == 200

        data = response.json()
        for entry in data["entries"]:
            assert entry["is_starter"] == True

    def test_filter_by_relievers(self, client):
        """Should filter to only relievers."""
        response = client.get("/api/leaderboards?stat=velocity&is_starter=false&min_pitches=100")
        assert response.status_code == 200

        data = response.json()
        for entry in data["entries"]:
            assert entry["is_starter"] == False

    def test_limit_results(self, client):
        """Should respect limit parameter."""
        response = client.get("/api/leaderboards?stat=velocity&limit=10&min_pitches=100")
        assert response.status_code == 200

        data = response.json()
        assert len(data["entries"]) <= 10

    def test_entry_structure(self, client):
        """Each entry should have required fields."""
        response = client.get("/api/leaderboards?stat=velocity&limit=10&min_pitches=100")
        assert response.status_code == 200

        entry = response.json()["entries"][0]
        assert "rank" in entry
        assert "pitcher_id" in entry
        assert "name" in entry
        assert "team" in entry
        assert "is_starter" in entry
        assert "value" in entry
        assert "games" in entry
        assert "pitch_count" in entry

    def test_horizontal_movement(self, client):
        """Should return horizontal movement rankings."""
        response = client.get("/api/leaderboards?stat=h_movement&limit=10&min_pitches=100")
        assert response.status_code == 200

        data = response.json()
        assert data["stat"] == "h_movement"
        assert data["unit"] == "in"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
