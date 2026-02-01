from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Index
from sqlalchemy.orm import relationship

from app.core.database import Base


class Pitch(Base):
    """Individual pitch data from Statcast."""

    __tablename__ = "pitches"

    id = Column(Integer, primary_key=True, index=True)

    # Foreign keys
    pitcher_id = Column(Integer, ForeignKey("pitchers.id"), index=True)

    # Game context
    game_pk = Column(Integer, index=True, nullable=False)
    game_date = Column(Date, index=True, nullable=False)
    game_year = Column(Integer, index=True, nullable=False)

    # Pitch identification
    pitch_type = Column(String(10), index=True)  # FF, SL, CU, CH, etc.
    pitch_name = Column(String(50))  # Full name: 4-Seam Fastball, Slider, etc.

    # Pitcher/Batter info
    pitcher_mlbam_id = Column(Integer, index=True)
    batter_mlbam_id = Column(Integer, index=True)
    batter_stand = Column(String(1))  # L or R
    p_throws = Column(String(1))  # L or R

    # Count and situation
    balls = Column(Integer)
    strikes = Column(Integer)
    outs_when_up = Column(Integer)
    inning = Column(Integer)
    inning_topbot = Column(String(10))  # Top or Bot
    at_bat_number = Column(Integer)
    pitch_number = Column(Integer)

    # Pitch characteristics
    release_speed = Column(Float)  # Velocity (mph)
    release_spin_rate = Column(Float)  # Spin rate (rpm)
    spin_axis = Column(Float)  # Spin axis (degrees)

    # Release point
    release_pos_x = Column(Float)
    release_pos_y = Column(Float)
    release_pos_z = Column(Float)
    release_extension = Column(Float)

    # Movement
    pfx_x = Column(Float)  # Horizontal movement (inches)
    pfx_z = Column(Float)  # Vertical movement (inches)

    # Location at plate
    plate_x = Column(Float)  # Horizontal position
    plate_z = Column(Float)  # Vertical position
    zone = Column(Integer)  # Strike zone (1-9 in zone, 11-14 out)
    sz_top = Column(Float)  # Strike zone top
    sz_bot = Column(Float)  # Strike zone bottom

    # Velocity components
    vx0 = Column(Float)
    vy0 = Column(Float)
    vz0 = Column(Float)
    ax = Column(Float)
    ay = Column(Float)
    az = Column(Float)

    # Result
    type = Column(String(1))  # B=Ball, S=Strike, X=In play
    description = Column(String(100))  # called_strike, swinging_strike, ball, hit_into_play, etc.
    events = Column(String(50))  # single, double, strikeout, walk, etc.

    # Batted ball data (only populated if ball in play)
    launch_speed = Column(Float)  # Exit velocity (mph)
    launch_angle = Column(Float)  # Launch angle (degrees)
    hit_distance_sc = Column(Float)  # Hit distance (feet)
    bb_type = Column(String(20))  # ground_ball, line_drive, fly_ball, popup
    hc_x = Column(Float)  # Hit coordinate X
    hc_y = Column(Float)  # Hit coordinate Y

    # Expected stats
    estimated_ba_using_speedangle = Column(Float)  # xBA
    estimated_woba_using_speedangle = Column(Float)  # xwOBA
    woba_value = Column(Float)
    babip_value = Column(Float)
    iso_value = Column(Float)

    # Run values
    delta_run_exp = Column(Float)  # Change in run expectancy

    # Relationships
    pitcher = relationship("Pitcher", back_populates="pitches")

    def __repr__(self):
        return f"<Pitch {self.pitch_type} {self.release_speed}mph>"


# Create indexes for common queries
Index("ix_pitches_pitcher_year", Pitch.pitcher_mlbam_id, Pitch.game_year)
Index("ix_pitches_game", Pitch.game_pk, Pitch.pitch_number)
Index("ix_pitches_type_year", Pitch.pitch_type, Pitch.game_year)
