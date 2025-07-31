from pydantic import BaseModel, ConfigDict, validator
from datetime import datetime
from typing import Optional
from uuid import UUID


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

    @validator('id', 'project_id', 'uploaded_by', pre=True)
    def convert_uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v


class FileListResponse(BaseModel):
    files: list[FileUploadResponse]
    total: int
