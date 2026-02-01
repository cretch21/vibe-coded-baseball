"""Season-level aggregated statistics for correlation analysis."""

from sqlalchemy import Column, Integer, Float, ForeignKey, Index
from sqlalchemy.orm import relationship

from app.core.database import Base


class SeasonStats(Base):
    """Pre-aggregated season-level statistics for each pitcher-year combination.

    This table combines Statcast-derived stats (aggregated from pitches table)
    with external stats from FanGraphs (via pybaseball). Used for correlation
    analysis in the Discover section.
    """

    __tablename__ = "season_stats"

    id = Column(Integer, primary_key=True, index=True)
    pitcher_id = Column(Integer, ForeignKey("pitchers.id"), nullable=False)
    year = Column(Integer, nullable=False, index=True)

    # Sample size metrics
    total_pitches = Column(Integer)
    games = Column(Integer)
    innings_pitched = Column(Float)

    # Statcast-derived stats (from pitches table)
    avg_velocity = Column(Float)        # Avg fastball velocity (FF, SI, FC, FT)
    max_velocity = Column(Float)        # Max velocity (all pitches)
    avg_spin_rate = Column(Float)       # Avg spin rate (all pitches)
    whiff_pct = Column(Float)           # Swinging strikes / total swings
    strike_pct = Column(Float)          # Strikes / total pitches
    zone_pct = Column(Float)            # Pitches in strike zone
    chase_pct = Column(Float)           # Swings on pitches outside zone
    h_movement = Column(Float)          # Avg horizontal movement (breaking balls)
    v_movement = Column(Float)          # Avg vertical movement (fastballs)
    first_strike_pct = Column(Float)    # First pitch strikes

    # External stats from FanGraphs (via pybaseball)
    era = Column(Float)                 # Earned Run Average
    fip = Column(Float)                 # Fielding Independent Pitching
    xfip = Column(Float)                # Expected FIP (normalized HR/FB)
    siera = Column(Float)               # Skill-Interactive ERA
    whip = Column(Float)                # Walks + Hits per IP
    k_per_9 = Column(Float)             # Strikeouts per 9 innings
    bb_per_9 = Column(Float)            # Walks per 9 innings
    hr_per_9 = Column(Float)            # Home runs per 9 innings
    war = Column(Float)                 # Wins Above Replacement

    # Batted ball stats
    gb_pct = Column(Float)              # Ground ball %
    fb_pct = Column(Float)              # Fly ball %
    ld_pct = Column(Float)              # Line drive %
    hard_hit_pct = Column(Float)        # Hard hit %
    barrel_pct = Column(Float)          # Barrel % (optimal launch angle + exit velo)

    # Relationships
    pitcher = relationship("Pitcher")

    __table_args__ = (
        Index("ix_season_stats_pitcher_year", "pitcher_id", "year", unique=True),
    )

    def __repr__(self):
        return f"<SeasonStats pitcher_id={self.pitcher_id} year={self.year}>"
