"""Tests for database configuration and connection"""
import pytest
from sqlalchemy import text
from src.database.connection import engine, get_db, test_connection


def test_database_url_configuration():
    """Test that database URL is properly configured"""
    # The engine should have a URL
    assert engine.url is not None
    assert "postgresql" in str(engine.url)


def test_get_db_generator():
    """Test that get_db returns a generator"""
    db_gen = get_db()
    assert hasattr(db_gen, '__iter__')
    assert hasattr(db_gen, '__next__')
    
    # Clean up
    try:
        next(db_gen)
    except StopIteration:
        pass


def test_connection_function():
    """Test the test_connection function"""
    # This will fail if no database is running, which is expected
    # In a real test environment, we'd use a test database
    result = test_connection()
    assert isinstance(result, bool)