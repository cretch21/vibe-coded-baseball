"""Service for computing statistical correlations and analysis.

Uses scipy.stats for statistical calculations.
"""

from typing import Optional
import numpy as np
from scipy import stats
from sqlalchemy.orm import Session

from app.models.season_stats import SeasonStats
from app.models.pitcher import Pitcher


# Stat configuration with metadata
STAT_CONFIGS = {
    # Statcast-derived stats
    "avg_velocity": {
        "name": "Avg Fastball Velocity",
        "description": "Average velocity on fastballs (mph)",
        "category": "Velocity",
    },
    "max_velocity": {
        "name": "Max Velocity",
        "description": "Maximum pitch velocity (mph)",
        "category": "Velocity",
    },
    "avg_spin_rate": {
        "name": "Avg Spin Rate",
        "description": "Average spin rate across all pitches (rpm)",
        "category": "Spin",
    },
    "whiff_pct": {
        "name": "Whiff %",
        "description": "Swinging strike rate (%)",
        "category": "Plate Discipline",
    },
    "strike_pct": {
        "name": "Strike %",
        "description": "Percentage of pitches that are strikes (%)",
        "category": "Command",
    },
    "zone_pct": {
        "name": "Zone %",
        "description": "Percentage of pitches in the strike zone (%)",
        "category": "Command",
    },
    "chase_pct": {
        "name": "Chase %",
        "description": "Swings on pitches outside the zone (%)",
        "category": "Plate Discipline",
    },
    "h_movement": {
        "name": "Horizontal Movement",
        "description": "Average horizontal break on breaking balls (in)",
        "category": "Movement",
    },
    "v_movement": {
        "name": "Vertical Movement",
        "description": "Average vertical rise on fastballs (in)",
        "category": "Movement",
    },
    "first_strike_pct": {
        "name": "First Pitch Strike %",
        "description": "Strikes on the first pitch of an at-bat (%)",
        "category": "Command",
    },
    # FanGraphs stats
    "era": {
        "name": "ERA",
        "description": "Earned Run Average",
        "category": "ERA Estimators",
    },
    "fip": {
        "name": "FIP",
        "description": "Fielding Independent Pitching",
        "category": "ERA Estimators",
    },
    "xfip": {
        "name": "xFIP",
        "description": "Expected FIP (normalized HR/FB rate)",
        "category": "ERA Estimators",
    },
    "siera": {
        "name": "SIERA",
        "description": "Skill-Interactive ERA",
        "category": "ERA Estimators",
    },
    "whip": {
        "name": "WHIP",
        "description": "Walks + Hits per Inning Pitched",
        "category": "Traditional",
    },
    "k_per_9": {
        "name": "K/9",
        "description": "Strikeouts per 9 innings",
        "category": "Strikeouts & Walks",
    },
    "bb_per_9": {
        "name": "BB/9",
        "description": "Walks per 9 innings",
        "category": "Strikeouts & Walks",
    },
    "hr_per_9": {
        "name": "HR/9",
        "description": "Home runs per 9 innings",
        "category": "Home Runs",
    },
    "war": {
        "name": "WAR",
        "description": "Wins Above Replacement",
        "category": "Value",
    },
    "gb_pct": {
        "name": "GB%",
        "description": "Ground ball percentage",
        "category": "Batted Ball",
    },
    "fb_pct": {
        "name": "FB%",
        "description": "Fly ball percentage",
        "category": "Batted Ball",
    },
    "ld_pct": {
        "name": "LD%",
        "description": "Line drive percentage",
        "category": "Batted Ball",
    },
    "hard_hit_pct": {
        "name": "Hard%",
        "description": "Hard hit ball percentage",
        "category": "Contact Quality",
    },
    "barrel_pct": {
        "name": "Barrel%",
        "description": "Barrel rate (optimal exit velo + launch angle)",
        "category": "Contact Quality",
    },
}


def get_stat_name(stat_id: str) -> str:
    """Get human-readable name for a stat."""
    return STAT_CONFIGS.get(stat_id, {}).get("name", stat_id)


def get_stat_category(stat_id: str) -> str:
    """Get category for a stat."""
    return STAT_CONFIGS.get(stat_id, {}).get("category", "Other")


class CorrelationService:
    """Service for computing statistical correlations."""

    def __init__(self, db: Session):
        self.db = db

    def _get_season_data(
        self,
        year: Optional[int] = None,
        is_starter: Optional[bool] = None,
        min_innings: float = 50.0,
    ) -> list:
        """Get season stats with optional filters."""
        query = (
            self.db.query(SeasonStats, Pitcher)
            .join(Pitcher, SeasonStats.pitcher_id == Pitcher.id)
        )

        if year:
            query = query.filter(SeasonStats.year == year)

        if is_starter is not None:
            query = query.filter(Pitcher.is_starter == is_starter)

        if min_innings > 0:
            query = query.filter(SeasonStats.innings_pitched >= min_innings)

        return query.all()

    def compute_correlation(
        self,
        stat_x: str,
        stat_y: str,
        year: Optional[int] = None,
        is_starter: Optional[bool] = None,
        min_innings: float = 50.0,
    ) -> dict:
        """
        Compute correlation between two stats.

        Returns correlation coefficient, R², p-value, regression line, and scatter data.
        """
        data = self._get_season_data(year, is_starter, min_innings)

        # Extract values
        points = []
        x_values = []
        y_values = []

        for season_stat, pitcher in data:
            x = getattr(season_stat, stat_x, None)
            y = getattr(season_stat, stat_y, None)

            if x is not None and y is not None:
                x_values.append(x)
                y_values.append(y)
                points.append({
                    "pitcher_id": pitcher.id,
                    "name": pitcher.name,
                    "team": pitcher.team,
                    "x": round(x, 3) if x else None,
                    "y": round(y, 3) if y else None,
                })

        if len(x_values) < 3:
            # Not enough data for correlation
            return {
                "correlation_r": 0,
                "r_squared": 0,
                "p_value": 1.0,
                "sample_size": len(x_values),
                "slope": 0,
                "intercept": 0,
                "equation": "Insufficient data",
                "scatter_data": points,
            }

        # Convert to numpy arrays
        x = np.array(x_values)
        y = np.array(y_values)

        # Compute correlation
        r, p_value = stats.pearsonr(x, y)

        # Linear regression
        slope, intercept, _, _, _ = stats.linregress(x, y)

        # Build equation string
        sign = "+" if intercept >= 0 else "-"
        equation = f"y = {slope:.3f}x {sign} {abs(intercept):.2f}"

        return {
            "correlation_r": round(r, 4),
            "r_squared": round(r ** 2, 4),
            "p_value": round(p_value, 6),
            "sample_size": len(x_values),
            "slope": round(slope, 4),
            "intercept": round(intercept, 4),
            "equation": equation,
            "scatter_data": points,
        }

    def compute_stickiness(
        self,
        stat: str,
        is_starter: Optional[bool] = None,
        min_innings: float = 50.0,
    ) -> dict:
        """
        Compute year-over-year stickiness for a stat.

        Correlates stat in Year N with stat in Year N+1 for the same pitcher.
        """
        # Get all season data
        query = (
            self.db.query(SeasonStats, Pitcher)
            .join(Pitcher, SeasonStats.pitcher_id == Pitcher.id)
        )

        if is_starter is not None:
            query = query.filter(Pitcher.is_starter == is_starter)

        if min_innings > 0:
            query = query.filter(SeasonStats.innings_pitched >= min_innings)

        all_data = query.order_by(SeasonStats.pitcher_id, SeasonStats.year).all()

        # Group by pitcher
        by_pitcher = {}
        for season_stat, pitcher in all_data:
            if pitcher.id not in by_pitcher:
                by_pitcher[pitcher.id] = {}
            by_pitcher[pitcher.id][season_stat.year] = getattr(season_stat, stat, None)

        # Build year-over-year pairs
        year_n = []
        year_n1 = []
        years_found = set()

        for pitcher_id, years in by_pitcher.items():
            sorted_years = sorted(years.keys())
            for i in range(len(sorted_years) - 1):
                y1 = sorted_years[i]
                y2 = sorted_years[i + 1]
                if y2 == y1 + 1:  # Consecutive years only
                    val1 = years[y1]
                    val2 = years[y2]
                    if val1 is not None and val2 is not None:
                        year_n.append(val1)
                        year_n1.append(val2)
                        years_found.add(y1)
                        years_found.add(y2)

        if len(year_n) < 3:
            return {
                "r_squared": 0,
                "sample_size": len(year_n),
                "years_analyzed": 0,
            }

        # Compute correlation
        r, _ = stats.pearsonr(np.array(year_n), np.array(year_n1))

        return {
            "r_squared": round(r ** 2, 4),
            "sample_size": len(year_n),
            "years_analyzed": len(years_found),
        }

    def compute_predictive_power(
        self,
        predictor_stat: str,
        target_stat: str,
        is_starter: Optional[bool] = None,
        min_innings: float = 50.0,
    ) -> dict:
        """
        Compute how well a stat predicts a target stat in the following year.

        Correlates predictor_stat in Year N with target_stat in Year N+1.
        """
        # Get all season data
        query = (
            self.db.query(SeasonStats, Pitcher)
            .join(Pitcher, SeasonStats.pitcher_id == Pitcher.id)
        )

        if is_starter is not None:
            query = query.filter(Pitcher.is_starter == is_starter)

        if min_innings > 0:
            query = query.filter(SeasonStats.innings_pitched >= min_innings)

        all_data = query.order_by(SeasonStats.pitcher_id, SeasonStats.year).all()

        # Group by pitcher
        by_pitcher = {}
        for season_stat, pitcher in all_data:
            if pitcher.id not in by_pitcher:
                by_pitcher[pitcher.id] = {}
            by_pitcher[pitcher.id][season_stat.year] = {
                "predictor": getattr(season_stat, predictor_stat, None),
                "target": getattr(season_stat, target_stat, None),
            }

        # Build prediction pairs
        predictor_values = []
        target_values = []

        for pitcher_id, years in by_pitcher.items():
            sorted_years = sorted(years.keys())
            for i in range(len(sorted_years) - 1):
                y1 = sorted_years[i]
                y2 = sorted_years[i + 1]
                if y2 == y1 + 1:  # Consecutive years only
                    pred = years[y1].get("predictor")
                    targ = years[y2].get("target")
                    if pred is not None and targ is not None:
                        predictor_values.append(pred)
                        target_values.append(targ)

        if len(predictor_values) < 3:
            return {
                "r_squared": 0,
                "sample_size": len(predictor_values),
            }

        # Compute correlation
        r, _ = stats.pearsonr(np.array(predictor_values), np.array(target_values))

        return {
            "r_squared": round(r ** 2, 4),
            "sample_size": len(predictor_values),
        }

    def compute_trend(
        self,
        stat_x: str,
        stat_y: str,
        is_starter: Optional[bool] = None,
        min_innings: float = 50.0,
        start_year: int = 2015,
        end_year: int = 2024,
    ) -> list:
        """
        Compute correlation trend across multiple years.

        Returns list of {year, r_squared, correlation_r, sample_size} for each year.
        """
        results = []

        for year in range(start_year, end_year + 1):
            data = self._get_season_data(year, is_starter, min_innings)

            x_values = []
            y_values = []

            for season_stat, _ in data:
                x = getattr(season_stat, stat_x, None)
                y = getattr(season_stat, stat_y, None)
                if x is not None and y is not None:
                    x_values.append(x)
                    y_values.append(y)

            if len(x_values) >= 3:
                r, _ = stats.pearsonr(np.array(x_values), np.array(y_values))
                results.append({
                    "year": year,
                    "r_squared": round(r ** 2, 4),
                    "correlation_r": round(r, 4),
                    "sample_size": len(x_values),
                })

        return results

    def get_all_stickiness_rankings(
        self,
        is_starter: Optional[bool] = None,
        min_innings: float = 50.0,
    ) -> list:
        """Compute stickiness for all stats and return sorted rankings."""
        results = []

        for stat_id in STAT_CONFIGS.keys():
            stickiness = self.compute_stickiness(stat_id, is_starter, min_innings)
            if stickiness["sample_size"] >= 10:
                results.append({
                    "stat": stat_id,
                    "stat_name": get_stat_name(stat_id),
                    "category": get_stat_category(stat_id),
                    **stickiness,
                })

        # Sort by R² descending
        results.sort(key=lambda x: x["r_squared"], reverse=True)

        # Add ranks
        for i, entry in enumerate(results):
            entry["rank"] = i + 1

        return results

    def get_all_predictive_rankings(
        self,
        target_stat: str = "era",
        is_starter: Optional[bool] = None,
        min_innings: float = 50.0,
    ) -> list:
        """Compute predictive power for all stats against a target."""
        results = []

        for stat_id in STAT_CONFIGS.keys():
            if stat_id == target_stat:
                continue

            stickiness = self.compute_stickiness(stat_id, is_starter, min_innings)
            predictive = self.compute_predictive_power(
                stat_id, target_stat, is_starter, min_innings
            )

            if stickiness["sample_size"] >= 10 and predictive["sample_size"] >= 10:
                combined = (stickiness["r_squared"] + predictive["r_squared"]) / 2
                results.append({
                    "stat": stat_id,
                    "stat_name": get_stat_name(stat_id),
                    "category": get_stat_category(stat_id),
                    "stickiness_r2": stickiness["r_squared"],
                    "predictive_r2": predictive["r_squared"],
                    "combined_score": round(combined, 4),
                    "sample_size": min(stickiness["sample_size"], predictive["sample_size"]),
                })

        # Sort by combined score descending
        results.sort(key=lambda x: x["combined_score"], reverse=True)

        # Add ranks
        for i, entry in enumerate(results):
            entry["rank"] = i + 1

        return results
