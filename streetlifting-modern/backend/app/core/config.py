from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # App settings
    app_name: str = "StreetLifting API"
    version: str = "1.0.0"
    debug: bool = False
    
    # Database
    database_url: str = "sqlite:///./streetlifting.db"
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS
    allowed_origins: list = ["http://localhost:3000", "http://localhost:5173"]
    
    # API
    api_v1_prefix: str = "/api/v1"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings() 