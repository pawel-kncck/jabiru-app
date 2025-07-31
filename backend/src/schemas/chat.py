"""Chat schemas for API endpoints"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID


class ChatMessage(BaseModel):
    """Individual chat message"""
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    """Chat request schema"""
    message: str = Field(..., min_length=1, description="User message")
    conversation_history: Optional[List[ChatMessage]] = Field(
        default=[], 
        description="Previous conversation messages for context"
    )


class ChatResponse(BaseModel):
    """Chat response schema"""
    message: str = Field(..., description="AI response message")
    usage: Optional[dict] = Field(None, description="Token usage information")
    cost: Optional[float] = Field(None, description="Estimated cost in USD")


class ChatStreamResponse(BaseModel):
    """Streaming chat response schema"""
    token: str = Field(..., description="Single token from the response")
    is_complete: bool = Field(default=False, description="Whether the response is complete")