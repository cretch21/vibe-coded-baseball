from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # Database
    database_url: str = "postgresql://postgres:baseball123@localhost:5432/pitch_analytics"

    # Environment
    environment: str = "development"

    # API
    api_prefix: str = "/api"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
