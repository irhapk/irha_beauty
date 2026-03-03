from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    DATABASE_URL: str
    TEST_DATABASE_URL: str = ""  # optional — only used in tests, not required in prod

    JWT_SECRET: str = "dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ENVIRONMENT: str = "dev"
    ADMIN_EMAIL: str = "info.irhapk0@gmail.com"
    CORS_ORIGINS: str = "http://localhost:3000"
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "noreply@send.irhapk.com"


settings = Settings()
