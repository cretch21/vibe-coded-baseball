"""Pydantic schemas for Pitcher API responses."""

from datetime import date
from typing import Optional
from pydantic import BaseModel


class PitcherBase(BaseModel):
    """Base pitcher schema with common fields."""

    mlbam_id: int
    name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    team: Optional[str] = None
    throws: Optional[str] = None
    is_starter: bool = False
    is_active: bool = True


class PitcherResponse(PitcherBase):
    """Pitcher response with database ID."""

    id: int

    class Config:
        from_attributes = True


class PitcherSearchResult(BaseModel):
    """Simplified pitcher for search autocomplete."""

    id: int
    mlbam_id: int
    name: str
    team: Optional[str] = None
    throws: Optional[str] = None

    class Config:
        from_attributes = True


class PitchBase(BaseModel):
    """Base pitch schema with key fields for responses."""

    id: int
    game_pk: int
    game_date: date
    game_year: int

    # Pitch identification
    pitch_type: Optional[str] = None
    pitch_name: Optional[str] = None

    # Batter context
    batter_stand: Optional[str] = None
    balls: Optional[int] = None
    strikes: Optional[int] = None
    inning: Optional[int] = None

    # Pitch characteristics
    release_speed: Optional[float] = None
    release_spin_rate: Optional[float] = None
    pfx_x: Optional[float] = None
    pfx_z: Optional[float] = None

    # Location
    plate_x: Optional[float] = None
    plate_z: Optional[float] = None
    zone: Optional[int] = None

    # Result
    type: Optional[str] = None
    description: Optional[str] = None
    events: Optional[str] = None

    # Batted ball data
    launch_speed: Optional[float] = None
    launch_angle: Optional[float] = None

    class Config:
        from_attributes = True


class PitchTypeStats(BaseModel):
    """Aggregated stats for a single pitch type."""

    pitch_type: str
    pitch_name: Optional[str] = None
    count: int
    usage_pct: float

    # Velocity
    avg_velocity: Optional[float] = None
    min_velocity: Optional[float] = None
    max_velocity: Optional[float] = None

    # Spin
    avg_spin_rate: Optional[float] = None

    # Movement
    avg_pfx_x: Optional[float] = None
    avg_pfx_z: Optional[float] = None

    # Results
    whiff_pct: Optional[float] = None
    called_strike_pct: Optional[float] = None
    ball_pct: Optional[float] = None
    in_play_pct: Optional[float] = None


class PitcherSeasonStats(BaseModel):
    """Aggregated season stats for a pitcher."""

    year: int
    total_pitches: int
    games: int

    # Velocity
    avg_velocity: Optional[float] = None
    max_velocity: Optional[float] = None

    # Overall results
    strike_pct: Optional[float] = None
    ball_pct: Optional[float] = None
    whiff_pct: Optional[float] = None
    in_play_pct: Optional[float] = None

    # Pitch arsenal
    pitch_types: list[PitchTypeStats] = []


class PitcherDetailResponse(PitcherResponse):
    """Full pitcher response with stats."""

    seasons: list[int] = []
    career_stats: Optional[PitcherSeasonStats] = None


class PaginatedResponse(BaseModel):
    """Generic paginated response wrapper."""

    items: list
    total: int
    page: int
    page_size: int
    total_pages: int
