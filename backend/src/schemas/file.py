from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class FileBase(BaseModel):
    filename: str
    mime_type: Optional[str] = None


class FileUploadResponse(FileBase):
    id: str
    path: str
    size: int
    project_id: str
    uploaded_by: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class FileListResponse(BaseModel):
    files: list[FileUploadResponse]
    total: int