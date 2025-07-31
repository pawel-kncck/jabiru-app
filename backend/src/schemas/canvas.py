from pydantic import BaseModel
from datetime import datetime
from typing import Dict, List, Any, Optional
from uuid import UUID


class CanvasBase(BaseModel):
    name: str


class CanvasCreate(CanvasBase):
    pass


class CanvasUpdate(BaseModel):
    name: Optional[str] = None
    content_json: Optional[Dict[str, Any]] = None


class Canvas(CanvasBase):
    id: UUID
    project_id: UUID
    content_json: Dict[str, Any]
    created_by: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CanvasList(BaseModel):
    canvases: List[Canvas]
    total: int
