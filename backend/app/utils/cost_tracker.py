import logging
from datetime import datetime
from typing import Dict, Optional
from app.config.openai_config import get_openai_settings

logger = logging.getLogger(__name__)

class CostTracker:
    """Utility class to track OpenAI API usage and costs"""
    
    def __init__(self):
        self.daily_usage: Dict[str, Dict] = {}
        self.total_cost: float = 0.0
        self.total_tokens: int = 0
        self.request_count: int = 0
        self.average_latency: float = 0.0
        self.pricing = get_openai_settings().pricing
        
    def track_request(
        self,
        model: str,
        tokens_used: int,
        latency: float,
        input_tokens: Optional[int] = None,
        output_tokens: Optional[int] = None
    ) -> None:
        """
        Track a single API request
        
        Args:
            model: The model used (e.g., "gpt-3.5-turbo")
            tokens_used: Total tokens used in the request
            latency: Request latency in seconds
            input_tokens: Optional breakdown of input tokens
            output_tokens: Optional breakdown of output tokens
        """
        today = datetime.now().strftime("%Y-%m-%d")
        
        if today not in self.daily_usage:
            self.daily_usage[today] = {
                "total_tokens": 0,
                "total_cost": 0.0,
                "requests": 0,
                "models": {}
            }
            
        if model not in self.daily_usage[today]["models"]:
            self.daily_usage[today]["models"][model] = {
                "tokens": 0,
                "cost": 0.0,
                "requests": 0
            }
            
        # Calculate cost
        model_pricing = self.pricing.get(model, self.pricing.get("gpt-3.5-turbo", {"input": 0, "output": 0}))
        if input_tokens and output_tokens:
            cost = (
                (input_tokens / 1000.0 * model_pricing["input"]) +
                (output_tokens / 1000.0 * model_pricing["output"])
            )
        else:
            # If token breakdown not provided, use average cost
            avg_token_cost = (model_pricing["input"] + model_pricing["output"]) / 2
            cost = tokens_used / 1000.0 * avg_token_cost
            
        # Update daily stats
        daily_model = self.daily_usage[today]["models"][model]
        daily_model["tokens"] += tokens_used
        daily_model["cost"] += cost
        daily_model["requests"] += 1
        
        self.daily_usage[today]["total_tokens"] += tokens_used
        self.daily_usage[today]["total_cost"] += cost
        self.daily_usage[today]["requests"] += 1
        
        # Update overall stats
        self.total_cost += cost
        self.total_tokens += tokens_used
        self.request_count += 1
        
        # Update average latency
        self.average_latency = (
            (self.average_latency * (self.request_count - 1) + latency) /
            self.request_count
        )
        
        # Log the usage
        logger.info(
            f"API Usage - Model: {model}, Tokens: {tokens_used}, "
            f"Cost: ${cost:.4f}, Total Cost: ${self.total_cost:.4f}"
        )
        
    def get_daily_summary(self, date: Optional[str] = None) -> Dict:
        """Get usage summary for a specific date"""
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")
            
        if date not in self.daily_usage:
            return {
                "total_tokens": 0,
                "total_cost": 0.0,
                "requests": 0,
                "models": {}
            }
            
        return self.daily_usage[date]
        
    def get_total_summary(self) -> Dict:
        """Get overall usage summary"""
        return {
            "total_tokens": self.total_tokens,
            "total_cost": self.total_cost,
            "total_requests": self.request_count,
            "average_latency": self.average_latency,
            "daily_breakdown": self.daily_usage
        } 