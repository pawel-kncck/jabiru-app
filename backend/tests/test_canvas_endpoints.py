import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.main import app
from src.database.connection import get_db
from src.models.user import User
from src.models.project import Project
from src.models.canvas import Canvas
from src.auth.utils import get_password_hash
from tests.test_main import override_get_db, engine, TestingSessionLocal


client = TestClient(app)
app.dependency_overrides[get_db] = override_get_db


def create_test_user(db: Session) -> User:
    user = User(
        username="canvastest",
        email="canvastest@example.com",
        password_hash=get_password_hash("testpass123")
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_test_project(db: Session, user: User) -> Project:
    project = Project(
        name="Canvas Test Project",
        description="For canvas testing",
        owner_id=user.id
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def get_auth_headers(username: str = "canvastest", password: str = "testpass123") -> dict:
    response = client.post(
        "/api/v1/users/login",
        data={"username": username, "password": password}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


class TestCanvasEndpoints:
    def test_create_canvas(self):
        db = TestingSessionLocal()
        try:
            user = create_test_user(db)
            project = create_test_project(db, user)
            headers = get_auth_headers()
            
            canvas_data = {
                "name": "My Analysis Canvas"
            }
            
            response = client.post(
                f"/api/v1/projects/{project.id}/canvases",
                headers=headers,
                json=canvas_data
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["name"] == "My Analysis Canvas"
            assert data["project_id"] == str(project.id)
            assert data["created_by"] == str(user.id)
            assert "id" in data
            assert "content_json" in data
            assert data["content_json"]["blocks"] == []
            assert data["content_json"]["version"] == "1.0"
            
        finally:
            db.query(Canvas).delete()
            db.query(Project).delete()
            db.query(User).delete()
            db.commit()
            db.close()
    
    def test_list_canvases(self):
        db = TestingSessionLocal()
        try:
            user = create_test_user(db)
            project = create_test_project(db, user)
            headers = get_auth_headers()
            
            # Create multiple canvases
            for i in range(3):
                canvas_data = {"name": f"Canvas {i+1}"}
                client.post(
                    f"/api/v1/projects/{project.id}/canvases",
                    headers=headers,
                    json=canvas_data
                )
            
            response = client.get(
                f"/api/v1/projects/{project.id}/canvases",
                headers=headers
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["total"] == 3
            assert len(data["canvases"]) == 3
            assert all(c["name"].startswith("Canvas") for c in data["canvases"])
            
        finally:
            db.query(Canvas).delete()
            db.query(Project).delete()
            db.query(User).delete()
            db.commit()
            db.close()
    
    def test_get_canvas(self):
        db = TestingSessionLocal()
        try:
            user = create_test_user(db)
            project = create_test_project(db, user)
            headers = get_auth_headers()
            
            # Create a canvas
            canvas_data = {"name": "Test Canvas"}
            create_response = client.post(
                f"/api/v1/projects/{project.id}/canvases",
                headers=headers,
                json=canvas_data
            )
            canvas_id = create_response.json()["id"]
            
            response = client.get(
                f"/api/v1/canvases/{canvas_id}",
                headers=headers
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == canvas_id
            assert data["name"] == "Test Canvas"
            
        finally:
            db.query(Canvas).delete()
            db.query(Project).delete()
            db.query(User).delete()
            db.commit()
            db.close()
    
    def test_update_canvas(self):
        db = TestingSessionLocal()
        try:
            user = create_test_user(db)
            project = create_test_project(db, user)
            headers = get_auth_headers()
            
            # Create a canvas
            canvas_data = {"name": "Original Name"}
            create_response = client.post(
                f"/api/v1/projects/{project.id}/canvases",
                headers=headers,
                json=canvas_data
            )
            canvas_id = create_response.json()["id"]
            
            # Update the canvas
            update_data = {
                "name": "Updated Name",
                "content_json": {
                    "blocks": [{"type": "text", "content": "Hello"}],
                    "version": "1.0"
                }
            }
            
            response = client.put(
                f"/api/v1/canvases/{canvas_id}",
                headers=headers,
                json=update_data
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["name"] == "Updated Name"
            assert len(data["content_json"]["blocks"]) == 1
            assert data["content_json"]["blocks"][0]["type"] == "text"
            
        finally:
            db.query(Canvas).delete()
            db.query(Project).delete()
            db.query(User).delete()
            db.commit()
            db.close()
    
    def test_delete_canvas(self):
        db = TestingSessionLocal()
        try:
            user = create_test_user(db)
            project = create_test_project(db, user)
            headers = get_auth_headers()
            
            # Create a canvas
            canvas_data = {"name": "To Delete"}
            create_response = client.post(
                f"/api/v1/projects/{project.id}/canvases",
                headers=headers,
                json=canvas_data
            )
            canvas_id = create_response.json()["id"]
            
            # Delete the canvas
            response = client.delete(
                f"/api/v1/canvases/{canvas_id}",
                headers=headers
            )
            
            assert response.status_code == 200
            assert response.json()["detail"] == "Canvas deleted successfully"
            
            # Verify it's deleted
            get_response = client.get(
                f"/api/v1/canvases/{canvas_id}",
                headers=headers
            )
            assert get_response.status_code == 404
            
        finally:
            db.query(Canvas).delete()
            db.query(Project).delete()
            db.query(User).delete()
            db.commit()
            db.close()
    
    def test_canvas_authorization(self):
        db = TestingSessionLocal()
        try:
            user1 = create_test_user(db)
            user2 = User(
                username="othercanvasuser",
                email="othercanvas@example.com",
                password_hash=get_password_hash("otherpass123")
            )
            db.add(user2)
            db.commit()
            
            project = create_test_project(db, user1)
            headers1 = get_auth_headers()
            headers2 = get_auth_headers("othercanvasuser", "otherpass123")
            
            # Create canvas as user1
            canvas_data = {"name": "Private Canvas"}
            create_response = client.post(
                f"/api/v1/projects/{project.id}/canvases",
                headers=headers1,
                json=canvas_data
            )
            canvas_id = create_response.json()["id"]
            
            # Try to access as user2
            response = client.get(
                f"/api/v1/canvases/{canvas_id}",
                headers=headers2
            )
            
            assert response.status_code == 404
            assert "Canvas not found" in response.json()["detail"]
            
        finally:
            db.query(Canvas).delete()
            db.query(Project).delete()
            db.query(User).delete()
            db.commit()
            db.close()