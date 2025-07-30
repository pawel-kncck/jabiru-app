import os
import mimetypes
from typing import List, Dict, Any
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from src.database.connection import get_db
from src.auth.dependencies import get_current_user
from src.models.user import User
from src.models.project import Project
from src.models.file import File as FileModel
from src.schemas.file import FileUploadResponse, FileListResponse
from src.storage.local import LocalFileStorage
from src.services.data_processing import DataProcessingService
from src.config import get_settings

router = APIRouter()
settings = get_settings()

storage = LocalFileStorage(settings.UPLOAD_DIRECTORY)

ALLOWED_EXTENSIONS = {'.csv', '.txt', '.json'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def validate_file(file: UploadFile) -> None:
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required"
        )
    
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
        )


def get_project_or_404(
    project_id: str,
    user_id: str,
    db: Session
) -> Project:
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == user_id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return project


@router.post("/projects/{project_id}/files", response_model=FileUploadResponse)
async def upload_file(
    project_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    validate_file(file)
    
    project = get_project_or_404(project_id, current_user.id, db)
    
    file_path, file_size = await storage.save_uploaded_file(file, project_id)
    
    mime_type = mimetypes.guess_type(file.filename)[0]
    
    db_file = FileModel(
        filename=file.filename,
        path=file_path,
        size=file_size,
        mime_type=mime_type,
        project_id=project_id,
        uploaded_by=current_user.id
    )
    
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    return db_file


@router.get("/projects/{project_id}/files", response_model=FileListResponse)
def list_project_files(
    project_id: str,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = get_project_or_404(project_id, current_user.id, db)
    
    query = db.query(FileModel).filter(FileModel.project_id == project_id)
    total = query.count()
    files = query.offset(skip).limit(limit).all()
    
    return FileListResponse(files=files, total=total)


@router.delete("/files/{file_id}")
def delete_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(FileModel).join(Project).filter(
        FileModel.id == file_id,
        Project.owner_id == current_user.id
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    storage.delete_file(file.path)
    
    db.delete(file)
    db.commit()
    
    return {"detail": "File deleted successfully"}


@router.get("/files/{file_id}/preview")
def preview_file(
    file_id: str,
    rows: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(FileModel).join(Project).filter(
        FileModel.id == file_id,
        Project.owner_id == current_user.id
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Only preview CSV files
    if not file.filename.lower().endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Preview only available for CSV files"
        )
    
    file_path = storage.get_full_path(file.path)
    
    try:
        df, metadata = DataProcessingService.parse_csv_file(file_path)
        preview = DataProcessingService.get_data_preview(df, rows=rows)
        
        return {
            "preview": preview,
            "metadata": metadata
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing file: {str(e)}"
        )


@router.get("/files/{file_id}/column-stats/{column_name}")
def get_column_statistics(
    file_id: str,
    column_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(FileModel).join(Project).filter(
        FileModel.id == file_id,
        Project.owner_id == current_user.id
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    if not file.filename.lower().endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Statistics only available for CSV files"
        )
    
    file_path = storage.get_full_path(file.path)
    
    try:
        df, _ = DataProcessingService.parse_csv_file(file_path)
        stats = DataProcessingService.get_column_statistics(df, column_name)
        return stats
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing file: {str(e)}"
        )