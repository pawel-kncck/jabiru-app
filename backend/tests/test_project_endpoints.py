"""Tests for project API endpoints"""
import pytest
from uuid import uuid4
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.models import User, Project as ProjectModel
from src.auth.utils import get_password_hash


@pytest.fixture
def test_user(db: Session):
    """Create a test user"""
    user = User(
        username="testuser",
        email="test@example.com",
        password_hash=get_password_hash("password123"),
        first_name="Test",
        last_name="User"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    yield user
    # Cleanup
    db.delete(user)
    db.commit()


@pytest.fixture
def auth_headers(client: TestClient, test_user: User):
    """Get authentication headers"""
    response = client.post(
        "/api/v1/users/login",
        json={"username": "testuser", "password": "password123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_project(db: Session, test_user: User):
    """Create a test project"""
    project = ProjectModel(
        name="Test Project",
        description="Test project description",
        owner_id=test_user.id
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    yield project
    # Cleanup
    db.delete(project)
    db.commit()


class TestProjectEndpoints:
    """Test project CRUD operations"""
    
    def test_create_project(self, client: TestClient, auth_headers: dict):
        """Test creating a new project"""
        response = client.post(
            "/api/v1/projects/",
            json={
                "name": "New Project",
                "description": "A brand new project"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "New Project"
        assert data["description"] == "A brand new project"
        assert "id" in data
        assert "owner_id" in data
        assert "created_at" in data
        assert "updated_at" in data
    
    def test_create_project_without_auth(self, client: TestClient):
        """Test creating project without authentication"""
        response = client.post(
            "/api/v1/projects/",
            json={
                "name": "New Project",
                "description": "A brand new project"
            }
        )
        
        assert response.status_code == 401
    
    def test_list_projects(self, client: TestClient, auth_headers: dict, test_project: ProjectModel):
        """Test listing user's projects"""
        response = client.get("/api/v1/projects/", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "projects" in data
        assert "total" in data
        assert data["total"] >= 1
        assert len(data["projects"]) >= 1
        
        # Check if test project is in the list
        project_ids = [p["id"] for p in data["projects"]]
        assert str(test_project.id) in project_ids
    
    def test_list_projects_pagination(self, client: TestClient, auth_headers: dict, db: Session, test_user: User):
        """Test project list pagination"""
        # Create multiple projects
        for i in range(15):
            project = ProjectModel(
                name=f"Project {i}",
                description=f"Description {i}",
                owner_id=test_user.id
            )
            db.add(project)
        db.commit()
        
        # Test first page
        response = client.get("/api/v1/projects/?skip=0&limit=10", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["projects"]) == 10
        assert data["total"] >= 15
        
        # Test second page
        response = client.get("/api/v1/projects/?skip=10&limit=10", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["projects"]) >= 5
    
    def test_get_project(self, client: TestClient, auth_headers: dict, test_project: ProjectModel):
        """Test getting a specific project"""
        response = client.get(f"/api/v1/projects/{test_project.id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_project.id)
        assert data["name"] == test_project.name
        assert data["description"] == test_project.description
    
    def test_get_nonexistent_project(self, client: TestClient, auth_headers: dict):
        """Test getting a project that doesn't exist"""
        fake_id = str(uuid4())
        response = client.get(f"/api/v1/projects/{fake_id}", headers=auth_headers)
        
        assert response.status_code == 404
        assert response.json()["detail"] == "Project not found"
    
    def test_get_other_users_project(self, client: TestClient, auth_headers: dict, db: Session):
        """Test that users can't access other users' projects"""
        # Create another user and their project
        other_user = User(
            username="otheruser",
            email="other@example.com",
            password_hash=get_password_hash("password"),
            first_name="Other",
            last_name="User"
        )
        db.add(other_user)
        db.commit()
        
        other_project = ProjectModel(
            name="Other's Project",
            description="Not accessible",
            owner_id=other_user.id
        )
        db.add(other_project)
        db.commit()
        
        # Try to access it with test user's auth
        response = client.get(f"/api/v1/projects/{other_project.id}", headers=auth_headers)
        
        assert response.status_code == 404
        assert response.json()["detail"] == "Project not found"
    
    def test_update_project(self, client: TestClient, auth_headers: dict, test_project: ProjectModel):
        """Test updating a project"""
        response = client.put(
            f"/api/v1/projects/{test_project.id}",
            json={
                "name": "Updated Project",
                "description": "Updated description"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Project"
        assert data["description"] == "Updated description"
        assert data["id"] == str(test_project.id)
    
    def test_partial_update_project(self, client: TestClient, auth_headers: dict, test_project: ProjectModel):
        """Test updating only some project fields"""
        response = client.put(
            f"/api/v1/projects/{test_project.id}",
            json={"name": "Only Name Updated"},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Only Name Updated"
        assert data["description"] == test_project.description  # Should remain unchanged
    
    def test_delete_project(self, client: TestClient, auth_headers: dict, test_project: ProjectModel, db: Session):
        """Test deleting a project"""
        project_id = test_project.id
        response = client.delete(f"/api/v1/projects/{project_id}", headers=auth_headers)
        
        assert response.status_code == 204
        
        # Verify project is deleted
        deleted_project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
        assert deleted_project is None
    
    def test_delete_nonexistent_project(self, client: TestClient, auth_headers: dict):
        """Test deleting a project that doesn't exist"""
        fake_id = str(uuid4())
        response = client.delete(f"/api/v1/projects/{fake_id}", headers=auth_headers)
        
        assert response.status_code == 404
        assert response.json()["detail"] == "Project not found"