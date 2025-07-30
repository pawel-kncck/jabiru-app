import os
import shutil
from pathlib import Path
from typing import Union, Optional
import aiofiles
from fastapi import UploadFile


class LocalFileStorage:
    def __init__(self, base_path: str = "uploads"):
        self.base_path = Path(base_path)
        self._ensure_directory_exists()
    
    def _ensure_directory_exists(self) -> None:
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    def _generate_file_path(self, project_id: str, filename: str) -> Path:
        project_directory = self.base_path / project_id
        project_directory.mkdir(parents=True, exist_ok=True)
        
        file_path = project_directory / filename
        counter = 1
        original_stem = file_path.stem
        suffix = file_path.suffix
        
        while file_path.exists():
            file_path = project_directory / f"{original_stem}_{counter}{suffix}"
            counter += 1
        
        return file_path
    
    async def save_uploaded_file(
        self, 
        file: UploadFile, 
        project_id: str
    ) -> tuple[str, int]:
        file_path = self._generate_file_path(project_id, file.filename or "unnamed")
        
        async with aiofiles.open(file_path, 'wb') as destination:
            file_size = 0
            while chunk := await file.read(8192):
                await destination.write(chunk)
                file_size += len(chunk)
        
        relative_path = str(file_path.relative_to(self.base_path))
        return relative_path, file_size
    
    async def read_file(self, file_path: str) -> bytes:
        full_path = self.base_path / file_path
        async with aiofiles.open(full_path, 'rb') as file:
            return await file.read()
    
    def delete_file(self, file_path: str) -> None:
        full_path = self.base_path / file_path
        if full_path.exists():
            full_path.unlink()
    
    def delete_project_directory(self, project_id: str) -> None:
        project_directory = self.base_path / project_id
        if project_directory.exists():
            shutil.rmtree(project_directory)
    
    def get_full_path(self, file_path: str) -> Path:
        return self.base_path / file_path