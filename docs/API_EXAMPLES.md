# API Examples: Stock Data Endpoint

Parent: See PLANNING.md Iteration 3: Yahoo Finance Integration

## Get Stock Info (Valid Ticker)

```
curl -X GET "http://localhost:8080/stock/AAPL"
```

**Response:**
```
{
  "symbol": "AAPL",
  "shortName": "Apple Inc.",
  "currency": "USD",
  "regularMarketPrice": 123.45,
  "marketCap": 1234567890
}
```

## Get Stock Info (Invalid Ticker)

```
curl -X GET "http://localhost:8080/stock/INVALIDTICKER123"
```

**Response:**
```
{
  "detail": "Invalid ticker or no data found."
}
```

## Note on Rate Limiting
If you make requests too quickly, you may see:
```
{
  "detail": "Rate limit exceeded. Try again later."
}
```

---
Update this file as you add new endpoints or features. 

---

## Note on Using curl and jq for API Testing

When testing API endpoints with curl and jq, be aware of how you combine output formatting and JSON parsing:

### Common jq Parse Error
If you use curl with the `-w` (write-out) flag to print the HTTP status code after the response, like this:

```
curl -L -s -w "\nHTTP Status: %{http_code}\n" "http://localhost:8080/api/news/?ticker=AAPL&source=live" | jq .
```
You may see an error:
```
jq: parse error: Invalid numeric literal at line 2, column 5
```
This happens because the output is not pure JSON (the status line is not valid JSON), so jq fails to parse it.

### Recommended Usage
To pretty-print JSON responses, use:
```
curl -L -s "http://localhost:8080/api/news/?ticker=AAPL&source=live" | jq .
```

If you want to see the HTTP status code as well, use two steps:
```
curl -L -s -o response.json -w "HTTP Status: %{http_code}\n" "http://localhost:8080/api/news/?ticker=AAPL&source=live"
jq . response.json
```

### Example: Test All News Sources
- **Live news only:**
  ```sh
  curl -L -s "http://localhost:8080/api/news/?ticker=AAPL&source=live" | jq .
  ```
- **Stored news only:**
  ```sh
  curl -L -s "http://localhost:8080/api/news/?ticker=AAPL&source=stored" | jq .
  ```
- **Merged news (default):**
  ```sh
  curl -L -s "http://localhost:8080/api/news/?ticker=AAPL&source=merged" | jq .
  ```

**Tip:** Always use the trailing slash (`/api/news/`) or `-L` to follow redirects, as FastAPI may redirect `/api/news` to `/api/news/`.

--- 

## SEC Filings API Examples

### 1. Search SEC Filings (Semantic Search)

**Request:**
```sh
curl -X POST "http://localhost:8080/api/sec/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Apple",
    "top_k": 5,
    "metadata_filter": null
  }' | jq .
```

**Response:**
```json
{
  "results": [
    {
      "id": "AAPL",
      "score": 0.803968906,
      "metadata": {
        "symbol": "AAPL",
        "shortName": "Apple Inc.",
        "marketCap": 2936079646720.0,
        ...
      }
    },
    ...
  ]
}
```

### 2. Get SEC Filings (Direct from EDGAR)

**Request:**
```sh
curl -L -s "http://localhost:8080/api/sec/filings?ticker=AAPL&filing_type=10-K&limit=2" | jq .
```

**Response:**
```json
{
  "filings": [
    "https://www.sec.gov/Archives/edgar/data/320193/000032019323000066/0000320193-23-000066-index.htm",
    ...
  ]
}
```

### 3. Analyze SEC Filings (LLM Agent)

**Request:**
```sh
curl -X POST "http://localhost:8080/api/sec/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "AAPL",
    "filing_type": "10-K",
    "limit": 1
  }' | jq .
```

**Response:**
```json
{
  "summary": "Apple's 10-K filing highlights ...",
  ...
}
```

**Note:**
- For all endpoints, use `-L` to follow redirects if needed.
- For POST endpoints, always specify `-H "Content-Type: application/json"` and use single quotes for the JSON body.
- If you use `-w` to print the HTTP status, see the jq note above.

--- 