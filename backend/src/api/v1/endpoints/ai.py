from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database.connection import get_db
from src.auth.dependencies import get_current_user
from src.models.user import User
from src.services.ai import OpenAIClient
from src.config import settings

router = APIRouter()


@router.get("/health")
async def check_ai_health(
    current_user: User = Depends(get_current_user)
):
    """Check if AI service is available and configured"""
    if not settings.OPENAI_API_KEY:
        return {
            "status": "not_configured",
            "message": "OpenAI API key not configured"
        }
    
    try:
        client = OpenAIClient(api_key=settings.OPENAI_API_KEY)
        is_healthy = await client.health_check()
        
        if is_healthy:
            return {
                "status": "healthy",
                "message": "AI service is operational",
                "model": client.model
            }
        else:
            return {
                "status": "unhealthy",
                "message": "AI service is not responding"
            }
    except Exception as e:
        return {
            "status": "error",
            "message": f"AI service error: {str(e)}"
        }


@router.get("/usage")
async def get_ai_usage(
    current_user: User = Depends(get_current_user)
):
    """Get AI usage statistics and cache info"""
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    try:
        client = OpenAIClient(api_key=settings.OPENAI_API_KEY)
        cache_stats = client.get_cache_stats()
        
        return {
            "cache": cache_stats,
            "model": client.model,
            "pricing": client.PRICING.get(client.model, {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))