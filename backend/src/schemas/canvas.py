from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Dict, List, Any, Optional


class CanvasBase(BaseModel):
    name: str


class CanvasCreate(CanvasBase):
    pass


class CanvasUpdate(BaseModel):
    name: Optional[str] = None
    content_json: Optional[Dict[str, Any]] = None


class Canvas(CanvasBase):
    id: str
    project_id: str
    content_json: Dict[str, Any]
    created_by: str
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class CanvasList(BaseModel):
    canvases: List[Canvas]
    total: int