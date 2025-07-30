"""Application configuration management"""
import os
from dotenv import load_dotenv
from typing import Optional

# Load environment variables
load_dotenv()

class Settings:
    """Application settings"""
    # Application
    APP_NAME: str = "Jabiru"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Server
    PORT: int = int(os.getenv("PORT", 5001))
    HOST: str = "0.0.0.0"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://user:password@localhost:5432/jabiru"
    )
    
    # JWT (for future use)
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", 30)
    )
    
    # API Keys (for future use)
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    
    # File Upload
    UPLOAD_DIRECTORY: str = os.getenv("UPLOAD_DIRECTORY", "uploads")
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ]
    
    @property
    def is_development(self) -> bool:
        """Check if running in development mode"""
        return self.ENVIRONMENT == "development"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode"""
        return self.ENVIRONMENT == "production"

# Create settings instance
settings = Settings()

def get_settings() -> Settings:
    """Get application settings"""
    return settings