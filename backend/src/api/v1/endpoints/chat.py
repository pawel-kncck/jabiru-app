"""Chat API endpoints for context-aware conversations"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import os

from src.database.connection import get_db
from src.auth.dependencies import get_current_user
from src.models.user import User
from src.models.project import Project
from src.schemas.chat import ChatRequest, ChatResponse
from src.services.ai.openai_client import OpenAIClient
from src.config import get_settings

router = APIRouter()
settings = get_settings()


def get_project_context(project_id: str, user_id: str, db: Session) -> str:
    """Get the context for a project"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == user_id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return project.context or ""


def prepare_messages_with_context(
    user_message: str,
    context: str,
    conversation_history: List[dict]
) -> List[dict]:
    """Prepare messages for the LLM with context prepended"""
    messages = []
    
    # System message with context
    if context:
        system_message = {
            "role": "system",
            "content": f"""You are an AI assistant helping with data analysis. 
Here is the context about the user's project:

{context}

Use this context to provide more relevant and specific insights when answering questions."""
        }
        messages.append(system_message)
    else:
        messages.append({
            "role": "system",
            "content": "You are an AI assistant helping with data analysis. Provide clear and helpful responses."
        })
    
    # Add conversation history
    for msg in conversation_history:
        messages.append({
            "role": msg.get("role", "user"),
            "content": msg.get("content", "")
        })
    
    # Add current user message
    messages.append({
        "role": "user",
        "content": user_message
    })
    
    return messages


@router.post("/projects/{project_id}/chat", response_model=ChatResponse)
def chat_with_context(
    project_id: str,
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a chat message with project context"""
    # Get project context
    context = get_project_context(project_id, current_user.id, db)
    
    # Prepare messages with context
    messages = prepare_messages_with_context(
        request.message,
        context,
        [msg.model_dump() for msg in request.conversation_history]
    )
    
    # Initialize OpenAI client
    try:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="OpenAI API key not configured. Please set OPENAI_API_KEY environment variable."
            )
        
        client = OpenAIClient(api_key=openai_api_key)
        
        # Get response from OpenAI
        response = client.complete(
            messages=messages,
            temperature=0.7,
            max_tokens=2000
        )
        
        return ChatResponse(
            message=response["content"],
            usage=response.get("usage"),
            cost=response.get("cost")
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chat request: {str(e)}"
        )


@router.get("/projects/{project_id}/chat/health")
def check_chat_health(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if chat service is available"""
    # Verify project exists
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check OpenAI API
    try:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            return {
                "status": "error",
                "message": "OpenAI API key not configured"
            }
        
        client = OpenAIClient(api_key=openai_api_key)
        is_healthy = client.health_check()
        
        return {
            "status": "healthy" if is_healthy else "error",
            "message": "Chat service is operational" if is_healthy else "Cannot connect to OpenAI API"
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }