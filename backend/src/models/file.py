from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.database.connection import Base
from src.database.types import GUID
import uuid


class File(Base):
    __tablename__ = "files"
    
    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String(255), nullable=False)
    path = Column(String(500), nullable=False, unique=True)
    size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=True)
    project_id = Column(GUID, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    uploaded_by = Column(GUID, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    project = relationship("Project", back_populates="files")
    uploader = relationship("User", back_populates="uploaded_files")
    
    def __repr__(self):
        return f"<File {self.filename}>"