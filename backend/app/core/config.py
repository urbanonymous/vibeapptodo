from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=None, extra="ignore")

    mongodb_url: str = "mongodb://mongodb:27017"
    mongodb_db: str = "vibe_tracker"
    cors_origins: str = "http://localhost:5173"

    firebase_project_id: str | None = None
    firebase_service_account_json: str | None = None

    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()

