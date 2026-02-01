"""API routes for Discover (Statistical Analysis) endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.correlation_service import (
    CorrelationService,
    STAT_CONFIGS,
    get_stat_name,
    get_stat_category,
)
from app.schemas.discover import (
    StatConfig,
    RegressionLine,
    ScatterPoint,
    CorrelationResponse,
    StickinessEntry,
    StickinessResponse,
    PredictiveEntry,
    PredictiveResponse,
    TrendPoint,
    TrendsResponse,
)

router = APIRouter(prefix="/discover", tags=["discover"])


@router.get("/stats", response_model=list[StatConfig])
async def get_available_stats():
    """
    Get list of available statistics for analysis.

    Returns metadata about each stat that can be used for correlation analysis.
    """
    return [
        StatConfig(
            id=stat_id,
            name=config["name"],
            description=config["description"],
            category=config["category"],
        )
        for stat_id, config in STAT_CONFIGS.items()
    ]


@router.get("/correlations", response_model=CorrelationResponse)
async def get_correlations(
    stat_x: str = Query(..., description="X-axis statistic"),
    stat_y: str = Query(..., description="Y-axis statistic"),
    year: Optional[int] = Query(None, description="Season year (None for all years)"),
    is_starter: Optional[bool] = Query(None, description="Filter by starter/reliever"),
    min_innings: float = Query(50.0, ge=0, description="Minimum innings pitched"),
    db: Session = Depends(get_db),
):
    """
    Get correlation between two statistics with scatter plot data.

    Returns Pearson correlation coefficient, R², regression line, and scatter points.
    """
    service = CorrelationService(db)
    result = service.compute_correlation(stat_x, stat_y, year, is_starter, min_innings)

    return CorrelationResponse(
        stat_x=stat_x,
        stat_x_name=get_stat_name(stat_x),
        stat_y=stat_y,
        stat_y_name=get_stat_name(stat_y),
        year=year,
        is_starter=is_starter,
        min_innings=min_innings,
        correlation_r=result["correlation_r"],
        r_squared=result["r_squared"],
        p_value=result["p_value"],
        sample_size=result["sample_size"],
        regression=RegressionLine(
            slope=result["slope"],
            intercept=result["intercept"],
            equation=result["equation"],
        ),
        scatter_data=[
            ScatterPoint(**point) for point in result["scatter_data"]
        ],
    )


@router.get("/stickiness", response_model=StickinessResponse)
async def get_stickiness(
    is_starter: Optional[bool] = Query(None, description="Filter by starter/reliever"),
    min_innings: float = Query(50.0, ge=0, description="Minimum innings pitched"),
    db: Session = Depends(get_db),
):
    """
    Get year-over-year stickiness rankings for all stats.

    Returns stats ranked by how consistent they are from one year to the next.
    Higher R² means the stat is more repeatable/skill-based.
    """
    service = CorrelationService(db)
    results = service.get_all_stickiness_rankings(is_starter, min_innings)

    return StickinessResponse(
        is_starter=is_starter,
        min_innings=min_innings,
        entries=[
            StickinessEntry(
                rank=entry["rank"],
                stat=entry["stat"],
                stat_name=entry["stat_name"],
                category=entry["category"],
                r_squared=entry["r_squared"],
                sample_size=entry["sample_size"],
                years_analyzed=entry["years_analyzed"],
            )
            for entry in results
        ],
    )


@router.get("/predictive", response_model=PredictiveResponse)
async def get_predictive_power(
    target_stat: str = Query("era", description="Target stat to predict"),
    is_starter: Optional[bool] = Query(None, description="Filter by starter/reliever"),
    min_innings: float = Query(50.0, ge=0, description="Minimum innings pitched"),
    db: Session = Depends(get_db),
):
    """
    Get predictive power rankings for all stats against a target.

    Returns stats ranked by their combined stickiness AND predictive power.
    Higher combined score means the stat is both repeatable AND predicts the target.
    """
    service = CorrelationService(db)
    results = service.get_all_predictive_rankings(target_stat, is_starter, min_innings)

    return PredictiveResponse(
        target_stat=target_stat,
        target_stat_name=get_stat_name(target_stat),
        is_starter=is_starter,
        min_innings=min_innings,
        entries=[
            PredictiveEntry(
                rank=entry["rank"],
                stat=entry["stat"],
                stat_name=entry["stat_name"],
                category=entry["category"],
                stickiness_r2=entry["stickiness_r2"],
                predictive_r2=entry["predictive_r2"],
                combined_score=entry["combined_score"],
                sample_size=entry["sample_size"],
            )
            for entry in results
        ],
    )


@router.get("/trends", response_model=TrendsResponse)
async def get_trends(
    stat_x: str = Query(..., description="X-axis statistic"),
    stat_y: str = Query(..., description="Y-axis statistic"),
    is_starter: Optional[bool] = Query(None, description="Filter by starter/reliever"),
    min_innings: float = Query(50.0, ge=0, description="Minimum innings pitched"),
    db: Session = Depends(get_db),
):
    """
    Get correlation trend across years (2015-present).

    Returns R² values for each year to show how the relationship changes over time.
    """
    service = CorrelationService(db)
    trend_data = service.compute_trend(stat_x, stat_y, is_starter, min_innings)

    # Calculate average R² and trend direction
    if trend_data:
        r2_values = [t["r_squared"] for t in trend_data]
        avg_r2 = sum(r2_values) / len(r2_values)

        # Determine trend direction
        if len(r2_values) >= 3:
            first_half = sum(r2_values[:len(r2_values)//2]) / (len(r2_values)//2)
            second_half = sum(r2_values[len(r2_values)//2:]) / (len(r2_values) - len(r2_values)//2)
            if second_half > first_half * 1.1:
                direction = "increasing"
            elif second_half < first_half * 0.9:
                direction = "decreasing"
            else:
                direction = "stable"
        else:
            direction = "stable"
    else:
        avg_r2 = 0
        direction = "stable"

    return TrendsResponse(
        stat_x=stat_x,
        stat_x_name=get_stat_name(stat_x),
        stat_y=stat_y,
        stat_y_name=get_stat_name(stat_y),
        is_starter=is_starter,
        min_innings=min_innings,
        trend_data=[
            TrendPoint(**point) for point in trend_data
        ],
        avg_r_squared=round(avg_r2, 4),
        trend_direction=direction,
    )
