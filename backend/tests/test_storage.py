import os
import tempfile
import pytest
from pathlib import Path
from fastapi import UploadFile
import io
import asyncio

from src.storage.local import LocalFileStorage


@pytest.fixture
def temp_storage_dir():
    with tempfile.TemporaryDirectory() as temp_dir:
        yield temp_dir


@pytest.fixture
def storage(temp_storage_dir):
    return LocalFileStorage(temp_storage_dir)


class TestLocalFileStorage:
    def test_ensure_directory_exists(self, temp_storage_dir):
        storage_path = Path(temp_storage_dir) / "nested" / "path"
        storage = LocalFileStorage(str(storage_path))
        assert storage_path.exists()
        assert storage_path.is_dir()
    
    def test_generate_file_path(self, storage):
        project_id = "test-project-123"
        filename = "data.csv"
        
        file_path = storage._generate_file_path(project_id, filename)
        
        assert project_id in str(file_path)
        assert filename in str(file_path)
        assert file_path.name == filename
    
    def test_generate_unique_file_path(self, storage):
        project_id = "test-project-123"
        filename = "data.csv"
        
        first_path = storage._generate_file_path(project_id, filename)
        first_path.touch()
        
        second_path = storage._generate_file_path(project_id, filename)
        
        assert first_path != second_path
        assert "data_1.csv" in str(second_path)
    
    @pytest.mark.asyncio
    async def test_save_uploaded_file(self, storage):
        project_id = "test-project-123"
        file_content = b"name,age\\nJohn,30\\nJane,25"
        file_like = io.BytesIO(file_content)
        
        upload_file = UploadFile(
            filename="test_data.csv",
            file=file_like
        )
        
        relative_path, file_size = await storage.save_uploaded_file(upload_file, project_id)
        
        assert relative_path == f"{project_id}/test_data.csv"
        assert file_size == len(file_content)
        
        saved_path = storage.base_path / relative_path
        assert saved_path.exists()
        assert saved_path.read_bytes() == file_content
    
    @pytest.mark.asyncio
    async def test_read_file(self, storage):
        project_id = "test-project-123"
        file_content = b"test content"
        file_path = f"{project_id}/test.txt"
        
        full_path = storage.base_path / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_bytes(file_content)
        
        read_content = await storage.read_file(file_path)
        
        assert read_content == file_content
    
    def test_delete_file(self, storage):
        project_id = "test-project-123"
        file_path = f"{project_id}/test.txt"
        
        full_path = storage.base_path / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.touch()
        
        assert full_path.exists()
        
        storage.delete_file(file_path)
        
        assert not full_path.exists()
    
    def test_delete_project_directory(self, storage):
        project_id = "test-project-123"
        
        project_dir = storage.base_path / project_id
        project_dir.mkdir(parents=True, exist_ok=True)
        
        for i in range(3):
            (project_dir / f"file{i}.txt").touch()
        
        assert project_dir.exists()
        assert len(list(project_dir.iterdir())) == 3
        
        storage.delete_project_directory(project_id)
        
        assert not project_dir.exists()
    
    def test_get_full_path(self, storage):
        file_path = "project/file.csv"
        full_path = storage.get_full_path(file_path)
        
        assert full_path == storage.base_path / file_path
        assert isinstance(full_path, Path)