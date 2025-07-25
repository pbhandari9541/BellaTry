from typing import List, Dict, Any, Optional
import time
import logging
from openai import OpenAI
from app.config.openai_config import get_openai_settings
import httpx
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type
from collections import deque
import openai
import logging
import backoff
import os

logger = logging.getLogger(__name__)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
# Removed module-level client initialization to prevent import-time errors

class RateLimitException(Exception):
    pass

class OpenAIService:
    """Service class for OpenAI or OpenRouter API interactions"""
    
    def __init__(self):
        self.settings = get_openai_settings()
        # Defensive checks for required config
        if not getattr(self.settings, 'api_key', None):
            logger.error("OpenAI API key is missing. Set OPENAI_API_KEY in your environment.")
            raise ValueError("OpenAI API key is missing. Set OPENAI_API_KEY in your environment.")
        if not getattr(self.settings, 'embedding_model', None):
            logger.error("OpenAI embedding model is missing. Set OPENAI_EMBEDDING_MODEL in your environment.")
            raise ValueError("OpenAI embedding model is missing. Set OPENAI_EMBEDDING_MODEL in your environment.")
        logger.info(f"OpenAIService initialized with model: {self.settings.default_model}, embedding model: {self.settings.embedding_model}")
        self.use_openrouter = self.settings.USE_OPENROUTER
        self.max_retries = self.settings.max_retries
        self.retry_delay = self.settings.retry_delay
        self.rate_limit_rpm = self.settings.RATE_LIMIT_RPM
        self.rate_limit_tpm = getattr(self.settings, 'RATE_LIMIT_TPM', 1000000)  # Default 1M tokens/min
        self._call_timestamps = deque()
        self._token_timestamps = deque()  # (timestamp, tokens)
        if not self.use_openrouter:
            self.client = OpenAI(
                api_key=self.settings.api_key,
                organization=self.settings.organization
            )
        else:
            self.openrouter_base_url = self.settings.OPENROUTER_BASE_URL
            self.openrouter_api_key = self.settings.OPENROUTER_API_KEY
    
    def _enforce_rate_limit(self, tokens_needed=0):
        now = time.time()
        window_start = now - 60
        # Remove timestamps outside the 1-minute window
        while self._call_timestamps and self._call_timestamps[0] < window_start:
            self._call_timestamps.popleft()
        while self._token_timestamps and self._token_timestamps[0][0] < window_start:
            self._token_timestamps.popleft()
        # Check RPM
        if len(self._call_timestamps) >= self.rate_limit_rpm:
            logger.error(f"[RateLimit] RPM exceeded. Raising RateLimitException.")
            raise RateLimitException("OpenAIService: Requests per minute rate limit exceeded.")
        # Check TPM
        tokens_used = sum(t for ts, t in self._token_timestamps)
        if tokens_used + tokens_needed > self.rate_limit_tpm:
            logger.error(f"[RateLimit] TPM exceeded. Used: {tokens_used}, Needed: {tokens_needed}. Raising RateLimitException.")
            raise RateLimitException("OpenAIService: Tokens per minute rate limit exceeded.")
        self._call_timestamps.append(now)
        if tokens_needed > 0:
            self._token_timestamps.append((now, tokens_needed))
    
    def _retry_decorator(self):
        return retry(
            stop=stop_after_attempt(self.max_retries),
            wait=wait_fixed(self.retry_delay),
            retry=retry_if_exception_type((httpx.HTTPError, Exception)),
            reraise=True
        )

    def create_completion(
        self,
        messages: list[Dict[str, str]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Create a chat completion
        
        Args:
            messages: List of message dictionaries
            model: Optional model override
            temperature: Optional temperature override
            max_tokens: Optional max tokens override
            
        Returns:
            Dictionary containing the API response
        """
        @self._retry_decorator()
        def _do_request():
            self._enforce_rate_limit()
            start_time = time.time()
            if self.use_openrouter:
                # OpenRouter API call
                url = f"{self.openrouter_base_url}/chat/completions"
                headers = {
                    "Authorization": f"Bearer {self.openrouter_api_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": model or self.settings.default_model,
                    "messages": messages,
                    "temperature": temperature or self.settings.default_temperature,
                    "max_tokens": max_tokens or 2000
                }
                with httpx.Client() as client:
                    response = client.post(url, headers=headers, json=payload)
                    response.raise_for_status()
                    data = response.json()
                end_time = time.time()
                latency = end_time - start_time
                return {
                    "content": data["choices"][0]["message"]["content"],
                    "model": data["model"],
                    "usage": data["usage"],
                    "latency": latency
                }
            else:
                response = self.client.chat.completions.create(
                    model=model or self.settings.default_model,
                    messages=messages,
                    temperature=temperature or self.settings.default_temperature,
                    max_tokens=max_tokens or 2000
                )
                end_time = time.time()
                latency = end_time - start_time
                logger.info(
                    f"OpenAI request completed: model={response.model}, "
                    f"tokens={response.usage.total_tokens}, latency={latency:.2f}s"
                )
                return {
                    "content": response.choices[0].message.content,
                    "model": response.model,
                    "usage": {
                        "prompt_tokens": response.usage.prompt_tokens,
                        "completion_tokens": response.usage.completion_tokens,
                        "total_tokens": response.usage.total_tokens
                    },
                    "latency": latency
                }

        # --- BEGIN ADDITIONAL DEBUG LOGGING ---
        try:
            logger.info(
                "[OpenAIService.create_completion] Prepared _do_request. Type: %s | Callable: %s | Decorated by tenacity: %s",
                type(_do_request), callable(_do_request), hasattr(_do_request, "retry")
            )
        except Exception as _log_exc:
            # Safeguard to ensure logging itself never breaks the flow.
            logger.error(
                "[OpenAIService.create_completion] Logging preparation failed: %s", _log_exc
            )
        # --- END ADDITIONAL DEBUG LOGGING ---
        try:
            return _do_request()
        except RateLimitException as e:
            logger.error(str(e))
            raise
        except Exception as e:
            logger.error(f"Error in OpenAI service: {str(e)}")
            raise
    
    def get_embedding(self, text: str) -> List[float]:
        """
        Get embeddings for text using OpenAI's or OpenRouter's embedding model.
        
        Args:
            text: Text to get embeddings for
            
        Returns:
            List of embedding floats
        """
        logger.info(f"get_embedding called with text: {text}")
        @self._retry_decorator()
        @rate_limited_openai_call
        def _do_request():
            # Estimate tokens needed (roughly 4 chars per token)
            tokens_needed = max(1, len(text) // 4)
            self._enforce_rate_limit(tokens_needed)
            if self.use_openrouter:
                url = f"{self.openrouter_base_url}/embeddings"
                headers = {
                    "Authorization": f"Bearer {self.openrouter_api_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": self.settings.embedding_model,
                    "input": text
                }
                with httpx.Client() as client:
                    response = client.post(url, headers=headers, json=payload)
                    response.raise_for_status()
                    data = response.json()
                return data["data"][0]["embedding"]
            else:
                response = self.client.embeddings.create(
                    model=self.settings.embedding_model,
                    input=text
                )
                # Track actual tokens used if available
                tokens_used = getattr(response, 'usage', None)
                if tokens_used and hasattr(tokens_used, 'total_tokens'):
                    self._enforce_rate_limit(tokens_used.total_tokens)
                return response.data[0].embedding
        try:
            result = _do_request()
            return result
        except RateLimitException as e:
            logger.error(str(e))
            raise
        except Exception as e:
            logger.error(f"Error getting embedding: {str(e)}")
            raise

    def analyze_sentiment(self, text):
        """Analyze sentiment of the given text using OpenAI API. Returns 'positive', 'negative', or 'neutral'."""
        prompt = (
            "Classify the sentiment of the following text as strictly one of: positive, negative, or neutral. "
            "Respond with only the single word label.\n\nText: " + text
        )
        try:
            response = self.create_completion(messages=[{"role": "user", "content": prompt}], max_tokens=1, temperature=0)
            label = response["content"].strip().lower() if isinstance(response, dict) and "content" in response else str(response).strip().lower()
            if label in ("positive", "negative", "neutral"):
                return label
            return "neutral"
        except Exception as e:
            print(f"Sentiment analysis failed: {e}")
            return "neutral"

# Removed module-level service initialization to prevent import-time errors 

# --- Rate limit config ---
OPENAI_RATE_LIMIT_PER_MIN = 60  # adjust to your OpenAI plan
OPENAI_MIN_INTERVAL = 60.0 / OPENAI_RATE_LIMIT_PER_MIN
_last_openai_call = 0

# --- Helper: Rate limit decorator for all OpenAI API calls ---
def rate_limited_openai_call(func):
    import functools
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        global _last_openai_call
        import time
        now = time.time()
        elapsed = now - _last_openai_call
        if elapsed < OPENAI_MIN_INTERVAL:
            time.sleep(OPENAI_MIN_INTERVAL - elapsed)
        _last_openai_call = time.time()
        return func(*args, **kwargs)
    return wrapper

# --- Use batching for embeddings ---
# (get_embeddings_with_retry already batches, but clarify in comments)
import backoff

OPENAI_RETRY_EXCEPTIONS = (
    openai.RateLimitError,
    openai.Timeout,
    openai.APIError,
    openai.APIConnectionError,
)

@backoff.on_exception(
    backoff.expo,
    Exception,
    max_tries=5,
    jitter=None
)
@rate_limited_openai_call
def get_embedding_with_retry(text, model="text-embedding-ada-002", timeout=20):
    try:
        client = get_openai_client()
        response = client.embeddings.create(
            input=[text],
            model=model
        )
        embedding = response.data[0].embedding
        logging.info(f"[OpenAI] Embedding created for text (len={len(text)})")
        return embedding
    except Exception as e:
        logging.error(f"[OpenAI] Embedding error: {e}")
        return None

def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    return openai.OpenAI(api_key=api_key)

# Correct embedding function for OpenAI v1+
def get_embeddings_with_retry(texts, model=None):
    """
    Get embeddings for a list of texts using OpenAI, with retry and batching.
    """
    from openai import OpenAIError
    client = get_openai_client()
    model = model or get_openai_settings().embedding_model
    # Estimate total tokens needed for batch
    tokens_needed = sum(max(1, len(t) // 4) for t in texts)
    # Enforce rate limit before batch call
    service = OpenAIService()
    service._enforce_rate_limit(tokens_needed)
    try:
        response = client.embeddings.create(input=texts, model=model)
        # Use attribute access for v1+ SDK
        # Track actual tokens used if available
        tokens_used = getattr(response, 'usage', None)
        if tokens_used and hasattr(tokens_used, 'total_tokens'):
            service._enforce_rate_limit(tokens_used.total_tokens)
        return [item.embedding for item in response.data]
    except OpenAIError as e:
        logging.error(f"[OpenAI] Embedding error: {e}")
        raise

@backoff.on_exception(
    backoff.expo,
    Exception,
    max_tries=5,
    jitter=None
)
@rate_limited_openai_call
def get_completion_with_retry(messages, model="gpt-3.5-turbo", timeout=30, **kwargs):
    try:
        client = get_openai_client()
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            timeout=timeout,
            **kwargs
        )
        return response['choices'][0]['message']['content']
    except openai.RateLimitError as e:
        logging.warning(f"[OpenAI] Rate limit hit: {e}")
        raise
    except Exception as e:
        logging.error(f"[OpenAI] Completion error: {e}")
        raise

# Example usage in your pipeline:
# embedding = get_embedding_with_retry(text)
# embeddings = get_embeddings_with_retry(list_of_texts)
# completion = get_completion_with_retry(messages) 

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    # Test embedding
    try:
        emb = get_embedding_with_retry("Test embedding for OpenAI robust service.")
        print("Embedding OK, length:", len(emb))
    except Exception as e:
        print("Embedding failed:", e)

    # Test completion
    try:
        msg = [{"role": "user", "content": "Say hello in a robust way."}]
        resp = get_completion_with_retry(msg)
        print("Completion OK:", resp)
    except Exception as e:
        print("Completion failed:", e) 