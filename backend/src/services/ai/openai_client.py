import os
import json
import hashlib
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import tiktoken
from openai import OpenAI
from functools import lru_cache


class OpenAIClient:
    """Client for interacting with OpenAI API with caching and cost tracking"""
    
    # Token pricing per 1M tokens (as of model gpt-3.5-turbo)
    PRICING = {
        "gpt-3.5-turbo": {"input": 0.5, "output": 1.5},
        "gpt-4": {"input": 30, "output": 60},
        "gpt-4-turbo-preview": {"input": 10, "output": 30}
    }
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-3.5-turbo"):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key not provided. Set OPENAI_API_KEY environment variable.")
        
        self.client = OpenAI(api_key=self.api_key)
        self.model = model
        self._cache: Dict[str, Any] = {}
        self._cache_expiry: Dict[str, datetime] = {}
        self.cache_duration = timedelta(hours=24)
        
    def _get_cache_key(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Generate a cache key from messages and parameters"""
        content = json.dumps({"messages": messages, "kwargs": kwargs}, sort_keys=True)
        return hashlib.md5(content.encode()).hexdigest()
    
    def _is_cache_valid(self, key: str) -> bool:
        """Check if cached response is still valid"""
        if key not in self._cache_expiry:
            return False
        return datetime.now() < self._cache_expiry[key]
    
    @lru_cache(maxsize=10)
    def count_tokens(self, text: str, model: Optional[str] = None) -> int:
        """Count tokens in text for the specified model"""
        model = model or self.model
        try:
            encoding = tiktoken.encoding_for_model(model)
        except KeyError:
            # Fallback to cl100k_base encoding
            encoding = tiktoken.get_encoding("cl100k_base")
        
        return len(encoding.encode(text))
    
    def estimate_cost(self, input_tokens: int, output_tokens: int, model: Optional[str] = None) -> float:
        """Estimate cost in USD for the given token counts"""
        model = model or self.model
        pricing = self.PRICING.get(model, self.PRICING["gpt-3.5-turbo"])
        
        input_cost = (input_tokens / 1_000_000) * pricing["input"]
        output_cost = (output_tokens / 1_000_000) * pricing["output"]
        
        return round(input_cost + output_cost, 4)
    
    async def complete(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        use_cache: bool = True,
        **kwargs
    ) -> Dict[str, Any]:
        """Send a completion request to OpenAI with caching"""
        # Check cache first
        cache_key = self._get_cache_key(messages, temperature=temperature, max_tokens=max_tokens, **kwargs)
        
        if use_cache and self._is_cache_valid(cache_key):
            return self._cache[cache_key]
        
        # Make API request
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                **kwargs
            )
            
            # Extract response data
            result = {
                "content": response.choices[0].message.content,
                "usage": {
                    "input_tokens": response.usage.prompt_tokens,
                    "output_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                },
                "cost": self.estimate_cost(
                    response.usage.prompt_tokens,
                    response.usage.completion_tokens
                ),
                "model": response.model,
                "cached": False
            }
            
            # Cache the result
            if use_cache:
                self._cache[cache_key] = result
                self._cache_expiry[cache_key] = datetime.now() + self.cache_duration
            
            return result
            
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")
    
    async def health_check(self) -> bool:
        """Check if OpenAI API is accessible"""
        try:
            # Use a minimal request to test connectivity
            await self.complete(
                messages=[{"role": "user", "content": "Hi"}],
                max_tokens=5,
                use_cache=False
            )
            return True
        except:
            return False
    
    def clear_cache(self) -> None:
        """Clear the response cache"""
        self._cache.clear()
        self._cache_expiry.clear()
    
    def get_cache_stats(self) -> Dict[str, int]:
        """Get cache statistics"""
        valid_entries = sum(1 for key in self._cache if self._is_cache_valid(key))
        return {
            "total_entries": len(self._cache),
            "valid_entries": valid_entries,
            "expired_entries": len(self._cache) - valid_entries
        }


# Chart generation prompt templates
CHART_PROMPTS = {
    "analyze_request": """
Analyze the following natural language request for creating a data visualization:

Request: {request}
Available data columns: {columns}

Provide a JSON response with:
1. chart_type: The type of chart (bar, line, pie, scatter)
2. x_column: The column to use for X axis (if applicable)
3. y_column: The column to use for Y axis (if applicable)
4. title: A descriptive title for the chart
5. aggregation: Any aggregation needed (sum, avg, count, none)
6. groupby: Column to group by (if applicable)

Respond only with valid JSON.
""",
    
    "generate_insights": """
Given the following data summary, generate 2-3 key insights:

Data columns: {columns}
Row count: {row_count}
Data preview: {preview}

Provide insights in a bulleted list format.
"""
}