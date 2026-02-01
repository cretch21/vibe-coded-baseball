"""Pydantic schemas for Discover (Statistical Analysis) API responses."""

from typing import Optional
from pydantic import BaseModel


class StatConfig(BaseModel):
    """Configuration for a single statistic."""

    id: str
    name: str
    description: str
    category: str


class ScatterPoint(BaseModel):
    """Single data point in a scatter plot."""

    pitcher_id: int
    name: str
    team: Optional[str] = None
    x: Optional[float] = None
    y: Optional[float] = None


class RegressionLine(BaseModel):
    """Linear regression line data."""

    slope: float
    intercept: float
    equation: str  # e.g., "y = 0.45x + 2.3"


class CorrelationResponse(BaseModel):
    """Response for correlation analysis."""

    stat_x: str
    stat_x_name: str
    stat_y: str
    stat_y_name: str
    year: Optional[int] = None
    is_starter: Optional[bool] = None
    min_innings: Optional[float] = None
    correlation_r: float
    r_squared: float
    p_value: float
    sample_size: int
    regression: RegressionLine
    scatter_data: list[ScatterPoint]


class StickinessEntry(BaseModel):
    """Single entry in stickiness rankings."""

    rank: int
    stat: str
    stat_name: str
    category: str
    r_squared: float
    sample_size: int
    years_analyzed: int


class StickinessResponse(BaseModel):
    """Response for stickiness analysis."""

    is_starter: Optional[bool] = None
    min_innings: Optional[float] = None
    entries: list[StickinessEntry]


class PredictiveEntry(BaseModel):
    """Single entry in predictive power rankings."""

    rank: int
    stat: str
    stat_name: str
    category: str
    stickiness_r2: float
    predictive_r2: float
    combined_score: float  # (stickiness + predictive) / 2
    sample_size: int


class PredictiveResponse(BaseModel):
    """Response for predictive power analysis."""

    target_stat: str
    target_stat_name: str
    is_starter: Optional[bool] = None
    min_innings: Optional[float] = None
    entries: list[PredictiveEntry]


class TrendPoint(BaseModel):
    """Single year in a trend analysis."""

    year: int
    r_squared: float
    correlation_r: float
    sample_size: int


class TrendsResponse(BaseModel):
    """Response for trends analysis."""

    stat_x: str
    stat_x_name: str
    stat_y: str
    stat_y_name: str
    is_starter: Optional[bool] = None
    min_innings: Optional[float] = None
    trend_data: list[TrendPoint]
    avg_r_squared: float
    trend_direction: str  # "increasing", "decreasing", "stable"
