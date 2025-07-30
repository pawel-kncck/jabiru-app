"""Tests for database models"""
import pytest
from datetime import datetime
import uuid

from src.models.user import User


def test_user_model_creation():
    """Test creating a User instance"""
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        username="testuser",
        email="test@example.com",
        password_hash="hashed_password",
        first_name="Test",
        last_name="User"
    )
    
    assert user.id == user_id
    assert user.username == "testuser"
    assert user.email == "test@example.com"
    assert user.password_hash == "hashed_password"
    assert user.first_name == "Test"
    assert user.last_name == "User"


def test_user_repr():
    """Test User string representation"""
    user = User(
        username="testuser",
        email="test@example.com",
        password_hash="hash"
    )
    
    assert repr(user) == "<User(username='testuser', email='test@example.com')>"


def test_user_full_name():
    """Test User full_name property"""
    # Test with both first and last name
    user1 = User(
        username="user1",
        email="user1@example.com",
        password_hash="hash",
        first_name="John",
        last_name="Doe"
    )
    assert user1.full_name == "John Doe"
    
    # Test with only first name
    user2 = User(
        username="user2",
        email="user2@example.com",
        password_hash="hash",
        first_name="Jane"
    )
    assert user2.full_name == "Jane"
    
    # Test with only last name
    user3 = User(
        username="user3",
        email="user3@example.com",
        password_hash="hash",
        last_name="Smith"
    )
    assert user3.full_name == "Smith"
    
    # Test with no names
    user4 = User(
        username="user4",
        email="user4@example.com",
        password_hash="hash"
    )
    assert user4.full_name == "user4"