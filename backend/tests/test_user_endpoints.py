"""Integration tests for user endpoints"""
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.main import app
from src.database.connection import Base, get_db
from src.models.user import User

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Handle UUID type for SQLite
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Enable foreign key support in SQLite"""
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


# Override the database dependency
app.dependency_overrides[get_db] = override_get_db

# Create test client
client = TestClient(app)


@pytest.fixture(autouse=True)
def create_tables():
    """Create tables before each test and drop after"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


class TestUserRegistration:
    """Test user registration endpoint"""
    
    def test_register_user_success(self):
        """Test successful user registration"""
        response = client.post(
            "/api/v1/users/register",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "testpassword123",
                "first_name": "Test",
                "last_name": "User"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
        assert data["first_name"] == "Test"
        assert data["last_name"] == "User"
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data
        assert "password" not in data
        assert "password_hash" not in data
        
    def test_register_user_duplicate_username(self):
        """Test registration with duplicate username"""
        # First registration
        client.post(
            "/api/v1/users/register",
            json={
                "username": "testuser",
                "email": "test1@example.com",
                "password": "testpassword123"
            }
        )
        
        # Second registration with same username
        response = client.post(
            "/api/v1/users/register",
            json={
                "username": "testuser",
                "email": "test2@example.com",
                "password": "testpassword123"
            }
        )
        
        assert response.status_code == 400
        assert "Username already registered" in response.json()["detail"]
        
    def test_register_user_duplicate_email(self):
        """Test registration with duplicate email"""
        # First registration
        client.post(
            "/api/v1/users/register",
            json={
                "username": "testuser1",
                "email": "test@example.com",
                "password": "testpassword123"
            }
        )
        
        # Second registration with same email
        response = client.post(
            "/api/v1/users/register",
            json={
                "username": "testuser2",
                "email": "test@example.com",
                "password": "testpassword123"
            }
        )
        
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]
        
    def test_register_user_invalid_email(self):
        """Test registration with invalid email"""
        response = client.post(
            "/api/v1/users/register",
            json={
                "username": "testuser",
                "email": "invalidemail",
                "password": "testpassword123"
            }
        )
        
        assert response.status_code == 422
        
    def test_register_user_short_password(self):
        """Test registration with short password"""
        response = client.post(
            "/api/v1/users/register",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "short"
            }
        )
        
        assert response.status_code == 422
        
    def test_register_user_short_username(self):
        """Test registration with short username"""
        response = client.post(
            "/api/v1/users/register",
            json={
                "username": "ab",
                "email": "test@example.com",
                "password": "testpassword123"
            }
        )
        
        assert response.status_code == 422


class TestUserLogin:
    """Test user login endpoint"""
    
    def setup_method(self):
        """Register a test user before each test"""
        client.post(
            "/api/v1/users/register",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "testpassword123"
            }
        )
        
    def test_login_success(self):
        """Test successful login"""
        response = client.post(
            "/api/v1/users/login",
            json={
                "username": "testuser",
                "password": "testpassword123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 0
        
    def test_login_wrong_password(self):
        """Test login with wrong password"""
        response = client.post(
            "/api/v1/users/login",
            json={
                "username": "testuser",
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]
        
    def test_login_nonexistent_user(self):
        """Test login with non-existent user"""
        response = client.post(
            "/api/v1/users/login",
            json={
                "username": "nonexistent",
                "password": "testpassword123"
            }
        )
        
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]


class TestCurrentUser:
    """Test current user endpoint"""
    
    def setup_method(self):
        """Register and login a test user"""
        # Register user
        client.post(
            "/api/v1/users/register",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "testpassword123",
                "first_name": "Test",
                "last_name": "User"
            }
        )
        
        # Login to get token
        response = client.post(
            "/api/v1/users/login",
            json={
                "username": "testuser",
                "password": "testpassword123"
            }
        )
        
        self.token = response.json()["access_token"]
        
    def test_get_current_user_success(self):
        """Test getting current user with valid token"""
        response = client.get(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
        assert data["first_name"] == "Test"
        assert data["last_name"] == "User"
        
    def test_get_current_user_no_token(self):
        """Test getting current user without token"""
        response = client.get("/api/v1/users/me")
        
        assert response.status_code == 401
        assert "Not authenticated" in response.json()["detail"]
        
    def test_get_current_user_invalid_token(self):
        """Test getting current user with invalid token"""
        response = client.get(
            "/api/v1/users/me",
            headers={"Authorization": "Bearer invalidtoken"}
        )
        
        assert response.status_code == 401
        assert "Could not validate credentials" in response.json()["detail"]