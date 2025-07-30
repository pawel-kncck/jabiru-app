"""Project API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from ....database.connection import get_db
from ....models import Project as ProjectModel, User as UserModel
from ....schemas.project import ProjectCreate, ProjectUpdate, Project, ProjectList
from ....auth.dependencies import get_current_user

router = APIRouter()


@router.post("/", response_model=Project)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Create a new project for the current user"""
    db_project = ProjectModel(
        name=project.name,
        description=project.description,
        owner_id=current_user.id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


@router.get("/", response_model=ProjectList)
def list_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """List all projects for the current user"""
    query = db.query(ProjectModel).filter(ProjectModel.owner_id == current_user.id)
    total = query.count()
    projects = query.offset(skip).limit(limit).all()
    
    return ProjectList(projects=projects, total=total)


@router.get("/{project_id}", response_model=Project)
def get_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get a specific project by ID"""
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.owner_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return project


@router.put("/{project_id}", response_model=Project)
def update_project(
    project_id: UUID,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Update a project"""
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.owner_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Delete a project"""
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.owner_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    return None