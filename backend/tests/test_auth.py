"""Tests for authentication utilities"""
import pytest
from datetime import datetime, timedelta
from jose import jwt, JWTError

from src.auth.utils import (
    create_access_token,
    decode_access_token,
    verify_password,
    get_password_hash
)
from src.config import settings


class TestPasswordHashing:
    """Test password hashing functionality"""
    
    def test_get_password_hash(self):
        """Test password hashing"""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        # Hash should be different from original
        assert hashed != password
        # Hash should be a valid bcrypt hash
        assert hashed.startswith("$2b$")
        
    def test_verify_password_correct(self):
        """Test password verification with correct password"""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed) is True
        
    def test_verify_password_incorrect(self):
        """Test password verification with incorrect password"""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        assert verify_password("wrongpassword", hashed) is False
        
    def test_different_hashes_for_same_password(self):
        """Test that same password generates different hashes"""
        password = "testpassword123"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        # Hashes should be different due to salt
        assert hash1 != hash2
        # But both should verify correctly
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True


class TestJWTTokens:
    """Test JWT token functionality"""
    
    def test_create_access_token(self):
        """Test creating an access token"""
        data = {"sub": "testuser"}
        token = create_access_token(data)
        
        assert isinstance(token, str)
        assert len(token) > 0
        
    def test_decode_access_token(self):
        """Test decoding a valid access token"""
        data = {"sub": "testuser", "user_id": 123}
        token = create_access_token(data)
        
        decoded = decode_access_token(token)
        assert decoded["sub"] == "testuser"
        assert decoded["user_id"] == 123
        assert "exp" in decoded
        
    def test_access_token_expiration(self):
        """Test that token includes expiration"""
        data = {"sub": "testuser"}
        expires_delta = timedelta(minutes=15)
        
        # Get current time before creating token
        now_before = datetime.utcnow()
        token = create_access_token(data, expires_delta=expires_delta)
        
        decoded = decode_access_token(token)
        exp_time = datetime.utcfromtimestamp(decoded["exp"])
        
        # Check that expiration is approximately 15 minutes from creation time
        time_diff = exp_time - now_before
        assert 14 <= time_diff.total_seconds() / 60 <= 16
        
    def test_expired_token(self):
        """Test that expired token raises error"""
        data = {"sub": "testuser"}
        # Create token that expires immediately
        expires_delta = timedelta(seconds=-1)
        token = create_access_token(data, expires_delta=expires_delta)
        
        with pytest.raises(JWTError):
            decode_access_token(token)
            
    def test_invalid_token(self):
        """Test that invalid token raises error"""
        with pytest.raises(JWTError):
            decode_access_token("invalid.token.here")
            
    def test_tampered_token(self):
        """Test that tampered token raises error"""
        data = {"sub": "testuser"}
        token = create_access_token(data)
        
        # Tamper with the token
        parts = token.split(".")
        tampered_token = f"{parts[0]}.tampered.{parts[2]}"
        
        with pytest.raises(JWTError):
            decode_access_token(tampered_token)