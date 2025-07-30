from sqlalchemy import Column, String, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.database.connection import Base
from src.database.types import GUID
import uuid


class Canvas(Base):
    __tablename__ = "canvases"
    
    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    project_id = Column(GUID, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    content_json = Column(JSON, nullable=False, default=lambda: {"blocks": [], "version": "1.0"})
    created_by = Column(GUID, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    project = relationship("Project", back_populates="canvases")
    creator = relationship("User", back_populates="created_canvases")
    
    def __repr__(self):
        return f"<Canvas {self.name} in project {self.project_id}>"