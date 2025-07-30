from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
import os

# Import our modules
from .config import settings
from .database.connection import test_connection
from .api.v1.api import api_router

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Jabiru API",
    description="AI-powered analytics platform backend",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Welcome to Jabiru API"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    # Test database connection
    db_status = "healthy" if test_connection() else "unhealthy"
    
    return {
        "status": "healthy",
        "service": "jabiru-backend",
        "version": "0.1.0",
        "database": db_status
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5001)),
        reload=True
    )