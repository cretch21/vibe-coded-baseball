from sqlalchemy import Column, Integer, String, Date

from app.core.database import Base


class Game(Base):
    """Game metadata table."""

    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    game_pk = Column(Integer, unique=True, index=True, nullable=False)  # MLB game ID
    game_date = Column(Date, index=True, nullable=False)
    game_year = Column(Integer, index=True, nullable=False)
    game_type = Column(String(10))  # R=Regular, P=Postseason, etc.
    home_team = Column(String(10), index=True)
    away_team = Column(String(10), index=True)

    def __repr__(self):
        return f"<Game {self.game_pk} ({self.game_date})>"
