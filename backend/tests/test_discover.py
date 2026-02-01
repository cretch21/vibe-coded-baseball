"""Tests for discover (statistical analysis) endpoints using SQLite and mock data."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.models.pitcher import Pitcher
from app.models.season_stats import SeasonStats


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

    db = TestingSessionLocal()

    # Create test pitchers
    pitchers = [
        Pitcher(id=1, mlbam_id=123456, name="Flamethrower Jones", team="NYY", throws="R", is_starter=True, is_active=True),
        Pitcher(id=2, mlbam_id=234567, name="Control Master Smith", team="LAD", throws="L", is_starter=True, is_active=True),
        Pitcher(id=3, mlbam_id=345678, name="Whiff King Williams", team="HOU", throws="R", is_starter=False, is_active=True),
        Pitcher(id=4, mlbam_id=456789, name="Movement Maven Davis", team="ATL", throws="R", is_starter=True, is_active=True),
        Pitcher(id=5, mlbam_id=567890, name="Spin Doctor Brown", team="SD", throws="L", is_starter=False, is_active=True),
    ]
    for p in pitchers:
        db.add(p)
    db.commit()

    # Create season stats for multiple years to test correlations and stickiness
    season_stats_data = [
        # 2023 data
        {"pitcher_id": 1, "year": 2023, "total_pitches": 3000, "games": 32, "innings_pitched": 200.0,
         "avg_velocity": 97.5, "max_velocity": 101.2, "avg_spin_rate": 2450, "whiff_pct": 32.5, "strike_pct": 65.0,
         "zone_pct": 48.0, "chase_pct": 28.0, "h_movement": 8.5, "v_movement": 14.2, "first_strike_pct": 62.0,
         "era": 2.85, "fip": 2.92, "xfip": 3.05, "siera": 3.10, "whip": 1.05,
         "k_per_9": 11.5, "bb_per_9": 2.5, "hr_per_9": 0.9, "war": 5.2,
         "gb_pct": 42.0, "fb_pct": 35.0, "ld_pct": 23.0, "hard_hit_pct": 32.0, "barrel_pct": 6.5},
        {"pitcher_id": 2, "year": 2023, "total_pitches": 2800, "games": 30, "innings_pitched": 185.0,
         "avg_velocity": 92.0, "max_velocity": 95.5, "avg_spin_rate": 2350, "whiff_pct": 24.0, "strike_pct": 70.0,
         "zone_pct": 52.0, "chase_pct": 22.0, "h_movement": 6.0, "v_movement": 12.0, "first_strike_pct": 68.0,
         "era": 3.25, "fip": 3.40, "xfip": 3.45, "siera": 3.50, "whip": 1.12,
         "k_per_9": 8.5, "bb_per_9": 2.0, "hr_per_9": 1.1, "war": 3.8,
         "gb_pct": 48.0, "fb_pct": 30.0, "ld_pct": 22.0, "hard_hit_pct": 30.0, "barrel_pct": 5.5},
        {"pitcher_id": 3, "year": 2023, "total_pitches": 1200, "games": 65, "innings_pitched": 72.0,
         "avg_velocity": 96.0, "max_velocity": 99.0, "avg_spin_rate": 2600, "whiff_pct": 38.0, "strike_pct": 62.0,
         "zone_pct": 45.0, "chase_pct": 35.0, "h_movement": 10.0, "v_movement": 13.0, "first_strike_pct": 58.0,
         "era": 2.50, "fip": 2.30, "xfip": 2.45, "siera": 2.55, "whip": 0.95,
         "k_per_9": 13.5, "bb_per_9": 3.0, "hr_per_9": 0.6, "war": 2.5,
         "gb_pct": 38.0, "fb_pct": 40.0, "ld_pct": 22.0, "hard_hit_pct": 28.0, "barrel_pct": 4.5},
        {"pitcher_id": 4, "year": 2023, "total_pitches": 2600, "games": 28, "innings_pitched": 170.0,
         "avg_velocity": 94.5, "max_velocity": 97.5, "avg_spin_rate": 2500, "whiff_pct": 28.0, "strike_pct": 66.0,
         "zone_pct": 50.0, "chase_pct": 26.0, "h_movement": 12.0, "v_movement": 15.0, "first_strike_pct": 64.0,
         "era": 3.10, "fip": 3.00, "xfip": 3.15, "siera": 3.20, "whip": 1.08,
         "k_per_9": 10.0, "bb_per_9": 2.2, "hr_per_9": 0.8, "war": 4.0,
         "gb_pct": 52.0, "fb_pct": 28.0, "ld_pct": 20.0, "hard_hit_pct": 29.0, "barrel_pct": 5.0},
        {"pitcher_id": 5, "year": 2023, "total_pitches": 1000, "games": 58, "innings_pitched": 65.0,
         "avg_velocity": 93.0, "max_velocity": 96.0, "avg_spin_rate": 2700, "whiff_pct": 30.0, "strike_pct": 64.0,
         "zone_pct": 47.0, "chase_pct": 30.0, "h_movement": 9.0, "v_movement": 11.0, "first_strike_pct": 60.0,
         "era": 3.45, "fip": 3.50, "xfip": 3.60, "siera": 3.65, "whip": 1.18,
         "k_per_9": 10.5, "bb_per_9": 3.5, "hr_per_9": 1.0, "war": 1.5,
         "gb_pct": 40.0, "fb_pct": 38.0, "ld_pct": 22.0, "hard_hit_pct": 34.0, "barrel_pct": 7.0},

        # 2024 data (for stickiness/predictive testing)
        {"pitcher_id": 1, "year": 2024, "total_pitches": 3100, "games": 33, "innings_pitched": 210.0,
         "avg_velocity": 97.0, "max_velocity": 100.8, "avg_spin_rate": 2420, "whiff_pct": 31.0, "strike_pct": 66.0,
         "zone_pct": 49.0, "chase_pct": 27.0, "h_movement": 8.2, "v_movement": 14.0, "first_strike_pct": 63.0,
         "era": 2.95, "fip": 3.00, "xfip": 3.10, "siera": 3.15, "whip": 1.08,
         "k_per_9": 11.0, "bb_per_9": 2.6, "hr_per_9": 1.0, "war": 4.8,
         "gb_pct": 41.0, "fb_pct": 36.0, "ld_pct": 23.0, "hard_hit_pct": 33.0, "barrel_pct": 6.8},
        {"pitcher_id": 2, "year": 2024, "total_pitches": 2700, "games": 29, "innings_pitched": 180.0,
         "avg_velocity": 91.5, "max_velocity": 95.0, "avg_spin_rate": 2320, "whiff_pct": 23.5, "strike_pct": 69.0,
         "zone_pct": 51.0, "chase_pct": 21.0, "h_movement": 5.8, "v_movement": 11.8, "first_strike_pct": 67.0,
         "era": 3.35, "fip": 3.50, "xfip": 3.55, "siera": 3.60, "whip": 1.15,
         "k_per_9": 8.2, "bb_per_9": 2.1, "hr_per_9": 1.2, "war": 3.5,
         "gb_pct": 47.0, "fb_pct": 31.0, "ld_pct": 22.0, "hard_hit_pct": 31.0, "barrel_pct": 5.8},
        {"pitcher_id": 3, "year": 2024, "total_pitches": 1250, "games": 68, "innings_pitched": 75.0,
         "avg_velocity": 95.5, "max_velocity": 98.5, "avg_spin_rate": 2580, "whiff_pct": 36.5, "strike_pct": 63.0,
         "zone_pct": 46.0, "chase_pct": 34.0, "h_movement": 9.8, "v_movement": 12.8, "first_strike_pct": 59.0,
         "era": 2.65, "fip": 2.45, "xfip": 2.55, "siera": 2.65, "whip": 0.98,
         "k_per_9": 13.0, "bb_per_9": 3.2, "hr_per_9": 0.7, "war": 2.3,
         "gb_pct": 37.0, "fb_pct": 41.0, "ld_pct": 22.0, "hard_hit_pct": 29.0, "barrel_pct": 4.8},
        {"pitcher_id": 4, "year": 2024, "total_pitches": 2700, "games": 30, "innings_pitched": 180.0,
         "avg_velocity": 94.0, "max_velocity": 97.0, "avg_spin_rate": 2480, "whiff_pct": 27.0, "strike_pct": 65.0,
         "zone_pct": 49.0, "chase_pct": 25.0, "h_movement": 11.5, "v_movement": 14.5, "first_strike_pct": 63.0,
         "era": 3.25, "fip": 3.15, "xfip": 3.25, "siera": 3.30, "whip": 1.10,
         "k_per_9": 9.5, "bb_per_9": 2.3, "hr_per_9": 0.9, "war": 3.5,
         "gb_pct": 51.0, "fb_pct": 29.0, "ld_pct": 20.0, "hard_hit_pct": 30.0, "barrel_pct": 5.2},
    ]

    for stats in season_stats_data:
        db.add(SeasonStats(**stats))
    db.commit()
    db.close()

    yield TestClient(app)

    # Cleanup
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


class TestAvailableStats:
    """Test /api/discover/stats endpoint."""

    def test_get_available_stats(self, client):
        """Should return list of available statistics."""
        response = client.get("/api/discover/stats")
        assert response.status_code == 200

        stats = response.json()
        assert isinstance(stats, list)
        assert len(stats) > 0

        # Check structure
        stat = stats[0]
        assert "id" in stat
        assert "name" in stat
        assert "description" in stat
        assert "category" in stat

    def test_stats_include_expected_categories(self, client):
        """Should include stats from multiple categories."""
        response = client.get("/api/discover/stats")
        stats = response.json()

        categories = {s["category"] for s in stats}
        assert "Velocity" in categories
        assert "ERA Estimators" in categories
        assert "Plate Discipline" in categories


class TestCorrelations:
    """Test /api/discover/correlations endpoint."""

    def test_get_correlation(self, client):
        """Should compute valid correlation between two stats."""
        response = client.get(
            "/api/discover/correlations?stat_x=avg_velocity&stat_y=whiff_pct&min_innings=50"
        )
        assert response.status_code == 200

        data = response.json()
        assert data["stat_x"] == "avg_velocity"
        assert data["stat_y"] == "whiff_pct"
        assert -1 <= data["correlation_r"] <= 1
        assert 0 <= data["r_squared"] <= 1
        assert data["sample_size"] > 0
        assert "regression" in data
        assert "scatter_data" in data

    def test_correlation_regression_line(self, client):
        """Should return valid regression line data."""
        response = client.get(
            "/api/discover/correlations?stat_x=k_per_9&stat_y=era&min_innings=50"
        )
        assert response.status_code == 200

        data = response.json()
        assert "slope" in data["regression"]
        assert "intercept" in data["regression"]
        assert "equation" in data["regression"]
        assert "y = " in data["regression"]["equation"]

    def test_correlation_scatter_data(self, client):
        """Should return scatter plot points."""
        response = client.get(
            "/api/discover/correlations?stat_x=avg_velocity&stat_y=era&min_innings=50"
        )
        assert response.status_code == 200

        data = response.json()
        assert len(data["scatter_data"]) > 0

        point = data["scatter_data"][0]
        assert "pitcher_id" in point
        assert "name" in point
        assert "x" in point
        assert "y" in point

    def test_filter_by_starters(self, client):
        """Should filter to only starters."""
        response = client.get(
            "/api/discover/correlations?stat_x=avg_velocity&stat_y=whiff_pct&is_starter=true&min_innings=50"
        )
        assert response.status_code == 200

        data = response.json()
        assert data["is_starter"] == True
        # We have 3 starters in mock data
        assert data["sample_size"] <= 6  # 3 starters * 2 years max

    def test_filter_by_year(self, client):
        """Should filter to specific year."""
        response = client.get(
            "/api/discover/correlations?stat_x=avg_velocity&stat_y=whiff_pct&year=2024&min_innings=50"
        )
        assert response.status_code == 200

        data = response.json()
        assert data["year"] == 2024


class TestStickiness:
    """Test /api/discover/stickiness endpoint."""

    def test_get_stickiness_rankings(self, client):
        """Should return stickiness rankings."""
        response = client.get("/api/discover/stickiness?min_innings=50")
        assert response.status_code == 200

        data = response.json()
        assert "entries" in data
        # We have consecutive years, so should have some entries
        if len(data["entries"]) > 0:
            entry = data["entries"][0]
            assert "rank" in entry
            assert "stat" in entry
            assert "stat_name" in entry
            assert "r_squared" in entry
            assert entry["rank"] == 1  # First entry should be rank 1

    def test_stickiness_ordered_by_r2(self, client):
        """Should be sorted by R² descending."""
        response = client.get("/api/discover/stickiness?min_innings=50")
        assert response.status_code == 200

        data = response.json()
        entries = data["entries"]
        if len(entries) > 1:
            for i in range(len(entries) - 1):
                assert entries[i]["r_squared"] >= entries[i + 1]["r_squared"]


class TestPredictive:
    """Test /api/discover/predictive endpoint."""

    def test_get_predictive_rankings(self, client):
        """Should return predictive power rankings."""
        response = client.get("/api/discover/predictive?target_stat=era&min_innings=50")
        assert response.status_code == 200

        data = response.json()
        assert data["target_stat"] == "era"
        assert "entries" in data

    def test_predictive_entry_structure(self, client):
        """Should have correct entry structure."""
        response = client.get("/api/discover/predictive?target_stat=era&min_innings=50")
        assert response.status_code == 200

        data = response.json()
        if len(data["entries"]) > 0:
            entry = data["entries"][0]
            assert "rank" in entry
            assert "stat" in entry
            assert "stickiness_r2" in entry
            assert "predictive_r2" in entry
            assert "combined_score" in entry

    def test_predictive_different_targets(self, client):
        """Should work with different target stats."""
        response = client.get("/api/discover/predictive?target_stat=whiff_pct&min_innings=50")
        assert response.status_code == 200

        data = response.json()
        assert data["target_stat"] == "whiff_pct"


class TestTrends:
    """Test /api/discover/trends endpoint."""

    def test_get_trends(self, client):
        """Should return trend data across years."""
        response = client.get(
            "/api/discover/trends?stat_x=avg_velocity&stat_y=whiff_pct&min_innings=50"
        )
        assert response.status_code == 200

        data = response.json()
        assert data["stat_x"] == "avg_velocity"
        assert data["stat_y"] == "whiff_pct"
        assert "trend_data" in data
        assert "avg_r_squared" in data
        assert "trend_direction" in data

    def test_trend_data_structure(self, client):
        """Should have correct trend point structure."""
        response = client.get(
            "/api/discover/trends?stat_x=k_per_9&stat_y=era&min_innings=50"
        )
        assert response.status_code == 200

        data = response.json()
        if len(data["trend_data"]) > 0:
            point = data["trend_data"][0]
            assert "year" in point
            assert "r_squared" in point
            assert "correlation_r" in point
            assert "sample_size" in point

    def test_trend_direction_valid(self, client):
        """Trend direction should be valid value."""
        response = client.get(
            "/api/discover/trends?stat_x=avg_velocity&stat_y=era&min_innings=50"
        )
        assert response.status_code == 200

        data = response.json()
        assert data["trend_direction"] in ["increasing", "decreasing", "stable"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
