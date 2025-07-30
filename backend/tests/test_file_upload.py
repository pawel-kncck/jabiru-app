import io
import pytest
import tempfile
import os
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.main import app
from src.database.connection import get_db
from src.models.user import User
from src.models.project import Project
from src.models.file import File
from src.auth.utils import get_password_hash
from tests.test_main import override_get_db, engine, TestingSessionLocal


client = TestClient(app)
app.dependency_overrides[get_db] = override_get_db


def create_test_user(db: Session) -> User:
    user = User(
        username="filetest",
        email="filetest@example.com",
        password_hash=get_password_hash("testpass123")
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_test_project(db: Session, user: User) -> Project:
    project = Project(
        name="Test Project",
        description="For file upload testing",
        owner_id=user.id
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def get_auth_headers(username: str = "filetest", password: str = "testpass123") -> dict:
    response = client.post(
        "/api/v1/users/login",
        data={"username": username, "password": password}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


class TestFileUpload:
    def test_upload_csv_file(self):
        db = TestingSessionLocal()
        try:
            user = create_test_user(db)
            project = create_test_project(db, user)
            headers = get_auth_headers()
            
            csv_content = b"name,age,email\\nJohn,30,john@example.com\\nJane,25,jane@example.com"
            file = io.BytesIO(csv_content)
            
            response = client.post(
                f"/api/v1/projects/{project.id}/files",
                headers=headers,
                files={"file": ("test.csv", file, "text/csv")}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["filename"] == "test.csv"
            assert data["size"] == len(csv_content)
            assert data["project_id"] == str(project.id)
            assert data["uploaded_by"] == str(user.id)
            assert "id" in data
            assert "path" in data
            assert "created_at" in data
            
            uploaded_file = db.query(File).filter(File.id == data["id"]).first()
            assert uploaded_file is not None
            assert uploaded_file.filename == "test.csv"
            assert uploaded_file.size == len(csv_content)
            
        finally:
            db.query(File).delete()
            db.query(Project).delete()
            db.query(User).delete()
            db.commit()
            db.close()
    
    def test_upload_invalid_file_type(self):
        db = TestingSessionLocal()
        try:
            user = create_test_user(db)
            project = create_test_project(db, user)
            headers = get_auth_headers()
            
            file_content = b"This is a PDF file"
            file = io.BytesIO(file_content)
            
            response = client.post(
                f"/api/v1/projects/{project.id}/files",
                headers=headers,
                files={"file": ("test.pdf", file, "application/pdf")}
            )
            
            assert response.status_code == 400
            assert "File type not allowed" in response.json()["detail"]
            
        finally:
            db.query(Project).delete()
            db.query(User).delete()
            db.commit()
            db.close()
    
    def test_list_project_files(self):
        db = TestingSessionLocal()
        try:
            user = create_test_user(db)
            project = create_test_project(db, user)
            headers = get_auth_headers()
            
            for i in range(3):
                csv_content = f"data{i}".encode()
                file = io.BytesIO(csv_content)
                client.post(
                    f"/api/v1/projects/{project.id}/files",
                    headers=headers,
                    files={"file": (f"test{i}.csv", file, "text/csv")}
                )
            
            response = client.get(
                f"/api/v1/projects/{project.id}/files",
                headers=headers
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["total"] == 3
            assert len(data["files"]) == 3
            assert all(f["filename"].startswith("test") for f in data["files"])
            
        finally:
            db.query(File).delete()
            db.query(Project).delete()
            db.query(User).delete()
            db.commit()
            db.close()
    
    def test_delete_file(self):
        db = TestingSessionLocal()
        try:
            user = create_test_user(db)
            project = create_test_project(db, user)
            headers = get_auth_headers()
            
            csv_content = b"test data"
            file = io.BytesIO(csv_content)
            
            upload_response = client.post(
                f"/api/v1/projects/{project.id}/files",
                headers=headers,
                files={"file": ("test.csv", file, "text/csv")}
            )
            
            file_id = upload_response.json()["id"]
            
            delete_response = client.delete(
                f"/api/v1/files/{file_id}",
                headers=headers
            )
            
            assert delete_response.status_code == 200
            assert delete_response.json()["detail"] == "File deleted successfully"
            
            deleted_file = db.query(File).filter(File.id == file_id).first()
            assert deleted_file is None
            
        finally:
            db.query(File).delete()
            db.query(Project).delete()
            db.query(User).delete()
            db.commit()
            db.close()
    
    def test_upload_to_nonexistent_project(self):
        db = TestingSessionLocal()
        try:
            user = create_test_user(db)
            headers = get_auth_headers()
            
            csv_content = b"test data"
            file = io.BytesIO(csv_content)
            
            response = client.post(
                "/api/v1/projects/00000000-0000-0000-0000-000000000000/files",
                headers=headers,
                files={"file": ("test.csv", file, "text/csv")}
            )
            
            assert response.status_code == 404
            assert "Project not found" in response.json()["detail"]
            
        finally:
            db.query(User).delete()
            db.commit()
            db.close()
    
    def test_unauthorized_file_access(self):
        db = TestingSessionLocal()
        try:
            user1 = create_test_user(db)
            user2 = User(
                username="otheruser",
                email="other@example.com",
                password_hash=get_password_hash("otherpass123")
            )
            db.add(user2)
            db.commit()
            
            project = create_test_project(db, user1)
            headers1 = get_auth_headers()
            headers2 = get_auth_headers("otheruser", "otherpass123")
            
            csv_content = b"test data"
            file = io.BytesIO(csv_content)
            
            upload_response = client.post(
                f"/api/v1/projects/{project.id}/files",
                headers=headers1,
                files={"file": ("test.csv", file, "text/csv")}
            )
            
            file_id = upload_response.json()["id"]
            
            delete_response = client.delete(
                f"/api/v1/files/{file_id}",
                headers=headers2
            )
            
            assert delete_response.status_code == 404
            assert "File not found" in delete_response.json()["detail"]
            
        finally:
            db.query(File).delete()
            db.query(Project).delete()
            db.query(User).delete()
            db.commit()
            db.close()
    
    def test_preview_csv_file(self):
        db = TestingSessionLocal()
        try:
            user = create_test_user(db)
            project = create_test_project(db, user)
            headers = get_auth_headers()
            
            # Create a test CSV file
            csv_content = "name,age,email\nJohn,30,john@example.com\nJane,25,jane@example.com"
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
                f.write(csv_content)
                temp_path = f.name
            
            # Create file record in database
            file_record = File(
                filename="test.csv",
                path=temp_path,
                size=len(csv_content),
                mime_type="text/csv",
                project_id=project.id,
                uploaded_by=user.id
            )
            db.add(file_record)
            db.commit()
            db.refresh(file_record)
            
            # Test preview endpoint
            response = client.get(
                f"/api/v1/files/{file_record.id}/preview",
                headers=headers
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "preview" in data
            assert "metadata" in data
            
            preview = data["preview"]
            assert len(preview["data"]) == 2
            assert preview["columns"] == ["name", "age", "email"]
            assert preview["total_rows"] == 2
            
            metadata = data["metadata"]
            assert metadata["total_rows"] == 2
            assert metadata["total_columns"] == 3
            assert metadata["delimiter"] == ","
            
            os.unlink(temp_path)
            
        finally:
            db.query(File).delete()
            db.query(Project).delete()
            db.query(User).delete()
            db.commit()
            db.close()
    
    def test_column_statistics(self):
        db = TestingSessionLocal()
        try:
            user = create_test_user(db)
            project = create_test_project(db, user)
            headers = get_auth_headers()
            
            # Create a test CSV file with numeric data
            csv_content = "name,age,salary\nJohn,30,50000\nJane,25,45000\nBob,35,60000"
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
                f.write(csv_content)
                temp_path = f.name
            
            # Create file record in database
            file_record = File(
                filename="test_stats.csv",
                path=temp_path,
                size=len(csv_content),
                mime_type="text/csv",
                project_id=project.id,
                uploaded_by=user.id
            )
            db.add(file_record)
            db.commit()
            db.refresh(file_record)
            
            # Test column statistics endpoint
            response = client.get(
                f"/api/v1/files/{file_record.id}/column-stats/age",
                headers=headers
            )
            
            assert response.status_code == 200
            stats = response.json()
            assert stats["column"] == "age"
            assert stats["total_values"] == 3
            assert stats["missing_values"] == 0
            assert "mean" in stats
            assert stats["mean"] == 30.0
            assert stats["min"] == 25.0
            assert stats["max"] == 35.0
            
            os.unlink(temp_path)
            
        finally:
            db.query(File).delete()
            db.query(Project).delete()
            db.query(User).delete()
            db.commit()
            db.close()