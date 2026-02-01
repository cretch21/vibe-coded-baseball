from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship

from app.core.database import Base


class Pitcher(Base):
    """Pitcher metadata table."""

    __tablename__ = "pitchers"

    id = Column(Integer, primary_key=True, index=True)
    mlbam_id = Column(Integer, unique=True, index=True, nullable=False)  # MLB Advanced Media ID
    name = Column(String(100), nullable=False, index=True)
    first_name = Column(String(50))
    last_name = Column(String(50))
    team = Column(String(10))  # Team abbreviation
    throws = Column(String(1))  # L or R
    is_starter = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    # Relationships
    pitches = relationship("Pitch", back_populates="pitcher")

    def __repr__(self):
        return f"<Pitcher {self.name} ({self.mlbam_id})>"
