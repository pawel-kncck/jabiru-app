"""API v1 router configuration"""
from fastapi import APIRouter

from .endpoints import users, projects, files, canvases

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(files.router, tags=["files"])
api_router.include_router(canvases.router, tags=["canvases"])