from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # Database - defaults to SQLite for easy local development
    # Set DATABASE_URL env var to use PostgreSQL in production
    database_url: str = ""

    # Environment
    environment: str = "development"

    # API
    api_prefix: str = "/api"

    class Config:
        env_file = ".env"
        extra = "ignore"
        # Allow both DATABASE_URL and database_url
        populate_by_name = True

    def get_database_url(self) -> str:
        """Get database URL, defaulting to SQLite if not set."""
        if self.database_url:
            return self.database_url
        # Default to SQLite in the backend directory
        backend_dir = Path(__file__).resolve().parent.parent.parent
        db_path = backend_dir / "baseball.db"
        # Use forward slashes for SQLite URL even on Windows
        return f"sqlite:///{db_path.as_posix()}"


settings = Settings()
