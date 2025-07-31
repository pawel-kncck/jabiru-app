from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.database.connection import get_db
from src.auth.dependencies import get_current_user
from src.models.user import User
from src.models.project import Project
from src.models.canvas import Canvas
from src.schemas.canvas import CanvasCreate, CanvasUpdate, Canvas as CanvasSchema, CanvasList

router = APIRouter()


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


@router.post("/projects/{project_id}/canvases", response_model=CanvasSchema)
def create_canvas(
    project_id: str,
    canvas_data: CanvasCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = get_project_or_404(project_id, current_user.id, db)

    db_canvas = Canvas(
        name=canvas_data.name,
        project_id=project_id,
        created_by=current_user.id
    )

    db.add(db_canvas)
    db.commit()
    db.refresh(db_canvas)

    return db_canvas


@router.get("/projects/{project_id}/canvases", response_model=CanvasList)
def list_canvases(
    project_id: str,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = get_project_or_404(project_id, current_user.id, db)

    query = db.query(Canvas).filter(Canvas.project_id == project_id)
    total = query.count()
    canvases = query.offset(skip).limit(limit).all()

    # Convert UUID fields to strings
    canvases_data = []
    for canvas in canvases:
        canvas_dict = {
            'id': str(canvas.id),
            'name': canvas.name,
            'project_id': str(canvas.project_id),
            'content_json': canvas.content_json,
            'created_by': str(canvas.created_by),
            'created_at': canvas.created_at,
            'updated_at': canvas.updated_at
        }
        canvases_data.append(canvas_dict)

    return CanvasList(canvases=canvases_data, total=total)


@router.get("/canvases/{canvas_id}", response_model=CanvasSchema)
def get_canvas(
    canvas_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    canvas = db.query(Canvas).join(Project).filter(
        Canvas.id == canvas_id,
        Project.owner_id == current_user.id
    ).first()

    if not canvas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Canvas not found"
        )

    return canvas


@router.put("/canvases/{canvas_id}", response_model=CanvasSchema)
def update_canvas(
    canvas_id: str,
    canvas_update: CanvasUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    canvas = db.query(Canvas).join(Project).filter(
        Canvas.id == canvas_id,
        Project.owner_id == current_user.id
    ).first()

    if not canvas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Canvas not found"
        )

    update_data = canvas_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(canvas, field, value)

    db.commit()
    db.refresh(canvas)

    return canvas


@router.delete("/canvases/{canvas_id}")
def delete_canvas(
    canvas_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    canvas = db.query(Canvas).join(Project).filter(
        Canvas.id == canvas_id,
        Project.owner_id == current_user.id
    ).first()

    if not canvas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Canvas not found"
        )

    db.delete(canvas)
    db.commit()

    return {"detail": "Canvas deleted successfully"}
