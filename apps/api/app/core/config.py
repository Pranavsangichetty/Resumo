from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./resumo.db"
    JWT_SECRET: str = "MwKhz3gIQ3w76bi3226n4BhzebExaKPGJhOGYs6c0JzUNB8o63IJ-Rlix29vJ2rqdwJEGbKgYipJAtq0k5QjHw"
    CORS_ORIGINS: str = "http://localhost:3000"

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""

    GEMINI_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()