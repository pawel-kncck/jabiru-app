"""Project schemas for API endpoints"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class ProjectBase(BaseModel):
    """Base project schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    """Schema for creating a project"""
    pass


class ProjectUpdate(BaseModel):
    """Schema for updating a project"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


class ProjectInDB(ProjectBase):
    """Project schema as stored in database"""
    id: UUID
    owner_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class Project(ProjectInDB):
    """Project schema for API responses"""
    pass


class ProjectList(BaseModel):
    """List of projects response"""
    projects: list[Project]
    total: int