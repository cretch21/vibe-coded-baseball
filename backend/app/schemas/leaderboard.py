"""Pydantic schemas for Leaderboard API responses."""

from typing import Optional
from pydantic import BaseModel


class LeaderboardEntry(BaseModel):
    """Single entry in a leaderboard ranking."""

    rank: int
    pitcher_id: int
    name: str
    team: Optional[str] = None
    is_starter: bool
    value: Optional[float] = None
    games: int
    pitch_count: int


class LeaderboardResponse(BaseModel):
    """Full leaderboard response with metadata."""

    stat: str
    stat_name: str
    stat_description: str
    unit: str
    year: int
    min_pitches: Optional[int] = None
    is_starter: Optional[bool] = None
    entries: list[LeaderboardEntry]
