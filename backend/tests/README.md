# Testing Strategy for Pinecone Integration

_This document describes the approach for mocking Pinecone in tests for the TradeAdvisor backend._

**Parent document:** [../README.md](../README.md)

---

## Why Mock Pinecone?
- **No real API calls:** Prevents network usage, cost, and data pollution.
- **Fast and reliable:** Tests run quickly and deterministically.
- **CI/CD safe:** No secrets or real Pinecone credentials needed.

## How It Works

1. **Early sys.modules Patching**
   - At the very top of `conftest.py`, we patch `sys.modules` to replace `pinecone` and all its submodules with mocks.
   - This ensures that any import of `pinecone` (even transitive) in the codebase uses the mock, not the real package.

2. **Custom Mock Client**
   - We define a `MockPineconeClient` class that implements only the methods our code uses (`list_indexes`, `create_index`, `delete_index`, `Index`).
   - This avoids the pitfalls of using `MagicMock` for objects that are instantiated and then called with arguments.

3. **Mocking pinecone.Pinecone**
   - We set `pinecone.Pinecone` to a `MagicMock` whose `side_effect` returns an instance of `MockPineconeClient` for any arguments.
   - This matches the real usage: `pinecone.Pinecone(api_key=..., environment=...)`.

4. **Environment Variables**
   - The fixture sets dummy Pinecone environment variables so code that reads them does not fail.

5. **Test Isolation**
   - All Pinecone interactions in tests are isolated and safe, with no risk of hitting the real API.

---

## Example (from `conftest.py`)

```python
import sys
from unittest.mock import MagicMock

# Patch sys.modules for pinecone and submodules BEFORE any other imports
mock_pinecone = MagicMock()
sys.modules['pinecone'] = mock_pinecone
sys.modules['pinecone.exceptions'] = MagicMock()
sys.modules['pinecone.core'] = MagicMock()
sys.modules['pinecone.core.client'] = MagicMock()
sys.modules['pinecone.db_control'] = MagicMock()

class MockPineconeClient:
    def list_indexes(self): return []
    def create_index(self, *a, **k): return None
    def delete_index(self, *a, **k): return None
    def Index(self, *a, **k): return MagicMock()

import pytest

@pytest.fixture(autouse=True)
def mock_pinecone_fixture(monkeypatch):
    mock_pinecone_class = MagicMock(side_effect=lambda *a, **k: MockPineconeClient())
    setattr(mock_pinecone, 'Pinecone', mock_pinecone_class)
    monkeypatch.setenv("PINECONE_API_KEY", "test-key")
    monkeypatch.setenv("PINECONE_ENVIRONMENT", "test-env")
```

---

**This approach ensures all Pinecone-related code is fully testable, robust, and safe for local and CI runs.** 