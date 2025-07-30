import pytest
import os
from unittest.mock import patch, AsyncMock, MagicMock
from datetime import datetime, timedelta

from src.services.ai.openai_client import OpenAIClient, CHART_PROMPTS


class TestOpenAIClient:
    @pytest.fixture
    def client(self):
        """Create OpenAI client with test API key"""
        return OpenAIClient(api_key="test-api-key")
    
    def test_initialization(self):
        """Test client initialization"""
        client = OpenAIClient(api_key="test-key")
        assert client.api_key == "test-key"
        assert client.model == "gpt-3.5-turbo"
        assert client.cache_duration == timedelta(hours=24)
    
    def test_initialization_from_env(self):
        """Test client initialization from environment"""
        with patch.dict(os.environ, {"OPENAI_API_KEY": "env-key"}):
            client = OpenAIClient()
            assert client.api_key == "env-key"
    
    def test_initialization_no_key(self):
        """Test client initialization without API key raises error"""
        with patch.dict(os.environ, {}, clear=True):
            with pytest.raises(ValueError, match="OpenAI API key not provided"):
                OpenAIClient()
    
    def test_count_tokens(self, client):
        """Test token counting"""
        text = "Hello, world!"
        count = client.count_tokens(text)
        assert count > 0
        assert isinstance(count, int)
    
    def test_estimate_cost(self, client):
        """Test cost estimation"""
        cost = client.estimate_cost(1000, 500)
        assert cost == 0.0008  # (1000/1M * 0.5) + (500/1M * 1.5)
        assert isinstance(cost, float)
    
    def test_cache_key_generation(self, client):
        """Test cache key generation is deterministic"""
        messages = [{"role": "user", "content": "Hello"}]
        key1 = client._get_cache_key(messages, temperature=0.7)
        key2 = client._get_cache_key(messages, temperature=0.7)
        key3 = client._get_cache_key(messages, temperature=0.8)
        
        assert key1 == key2
        assert key1 != key3
    
    def test_cache_validity(self, client):
        """Test cache validity checking"""
        key = "test-key"
        
        # Not in cache
        assert not client._is_cache_valid(key)
        
        # Add to cache with future expiry
        client._cache_expiry[key] = datetime.now() + timedelta(hours=1)
        assert client._is_cache_valid(key)
        
        # Expired cache
        client._cache_expiry[key] = datetime.now() - timedelta(hours=1)
        assert not client._is_cache_valid(key)
    
    @pytest.mark.asyncio
    async def test_complete_with_cache(self, client):
        """Test completion request with caching"""
        messages = [{"role": "user", "content": "Test"}]
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content="Response"))]
        mock_response.usage.prompt_tokens = 10
        mock_response.usage.completion_tokens = 5
        mock_response.usage.total_tokens = 15
        mock_response.model = "gpt-3.5-turbo"
        
        with patch.object(client.client.chat.completions, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_response
            
            # First call - should hit API
            result1 = await client.complete(messages)
            assert result1["content"] == "Response"
            assert result1["cached"] is False
            assert mock_create.call_count == 1
            
            # Second call - should use cache
            result2 = await client.complete(messages)
            assert result2["content"] == "Response"
            assert mock_create.call_count == 1  # No additional API call
    
    @pytest.mark.asyncio
    async def test_complete_without_cache(self, client):
        """Test completion request without caching"""
        messages = [{"role": "user", "content": "Test"}]
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content="Response"))]
        mock_response.usage.prompt_tokens = 10
        mock_response.usage.completion_tokens = 5
        mock_response.usage.total_tokens = 15
        mock_response.model = "gpt-3.5-turbo"
        
        with patch.object(client.client.chat.completions, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_response
            
            # Multiple calls without cache should all hit API
            await client.complete(messages, use_cache=False)
            await client.complete(messages, use_cache=False)
            
            assert mock_create.call_count == 2
    
    @pytest.mark.asyncio
    async def test_health_check(self, client):
        """Test health check"""
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content="Hi"))]
        mock_response.usage.prompt_tokens = 1
        mock_response.usage.completion_tokens = 1
        mock_response.usage.total_tokens = 2
        mock_response.model = "gpt-3.5-turbo"
        
        with patch.object(client.client.chat.completions, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_response
            
            result = await client.health_check()
            assert result is True
            
            # Health check failure
            mock_create.side_effect = Exception("API Error")
            result = await client.health_check()
            assert result is False
    
    def test_clear_cache(self, client):
        """Test cache clearing"""
        client._cache["key1"] = "value1"
        client._cache_expiry["key1"] = datetime.now()
        
        client.clear_cache()
        
        assert len(client._cache) == 0
        assert len(client._cache_expiry) == 0
    
    def test_cache_stats(self, client):
        """Test cache statistics"""
        # Empty cache
        stats = client.get_cache_stats()
        assert stats["total_entries"] == 0
        assert stats["valid_entries"] == 0
        assert stats["expired_entries"] == 0
        
        # Add valid and expired entries
        client._cache["valid"] = "data"
        client._cache_expiry["valid"] = datetime.now() + timedelta(hours=1)
        
        client._cache["expired"] = "data"
        client._cache_expiry["expired"] = datetime.now() - timedelta(hours=1)
        
        stats = client.get_cache_stats()
        assert stats["total_entries"] == 2
        assert stats["valid_entries"] == 1
        assert stats["expired_entries"] == 1
    
    def test_chart_prompts(self):
        """Test that chart prompts are defined"""
        assert "analyze_request" in CHART_PROMPTS
        assert "generate_insights" in CHART_PROMPTS
        
        # Test prompt formatting
        prompt = CHART_PROMPTS["analyze_request"].format(
            request="Show sales by month",
            columns=["date", "sales", "product"]
        )
        assert "Show sales by month" in prompt
        assert "date" in prompt