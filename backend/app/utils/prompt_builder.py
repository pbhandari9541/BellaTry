from __future__ import annotations

"""Prompt builder helpers used by RAG endpoints.

This module is **stand-alone** – no external runtime deps – so importing it in
services does **not** enlarge the dependency footprint.  All future prompt
changes should happen here so prompts stay versioned & unit-tested.

Rules followed:
• No business logic – only prompt templating.
• Fully deterministic – easy to snapshot in unit tests.
"""

from typing import Dict, Sequence, List
import textwrap
import json
import re

# Small, curated subset of stock metadata fields that are actually useful in an
# LLM prompt.  We avoid overloading the context window with noisy numbers.
_RELEVANT_META_KEYS: Sequence[str] = (
    "Name",
    "symbol",
    "Sector",
    "Industry",
    "MarketCapitalization",
    "52WeekHigh",
    "52WeekLow",
    "TrailingPE",
    "ForwardPE",
    "PEGRatio",
    "PriceToBookRatio",
    "DividendYield",
    "AnalystRatingStrongBuy",
    "AnalystRatingBuy",
    "AnalystRatingHold",
    "AnalystRatingSell",
    "AnalystRatingStrongSell",
)


def _filter_metadata(metadata: Dict[str, str | int | float]) -> Dict[str, str | int | float]:
    """Return a filtered copy of *metadata* containing only relevant keys."""
    return {k: v for k, v in metadata.items() if k in _RELEVANT_META_KEYS}


def render_value(value):
    if isinstance(value, list):
        # Render as bullet list
        return "\n".join(f"- {item}" for item in value)
    elif isinstance(value, dict):
        # Render as a markdown table
        if not value:
            return ""
        headers = list(value.keys())
        rows = zip(*[v if isinstance(v, list) else [v] for v in value.values()])
        table = "| " + " | ".join(headers) + " |\n"
        table += "| " + " | ".join("---" for _ in headers) + " |\n"
        for row in rows:
            table += "| " + " | ".join(str(cell) for cell in row) + " |\n"
        return table
    return str(value) if value is not None else ""

def build_markdown_report(template: str, context: dict) -> str:
    """
    Replace all {{placeholders}} in the template with values from context.
    Supports scalars, lists (as bullet lists), and dicts (as tables).
    """
    def replacer(match):
        key = match.group(1)
        return render_value(context.get(key, f"{{{{{key}}}}}"))
    return re.sub(r"\{\{(\w+)\}\}", replacer, template)

# Update SUMMARY_TEMPLATE to use Pinecone metadata field names
SUMMARY_TEMPLATE = """
# {{symbol}} Analysis

## Company Overview
- Name: {{Name}}
- Short Name: {{shortName}}
- Description: {{Description}}
- Address: {{Address}}
- Official Site: {{OfficialSite}}
- Sector: {{Sector}}
- Industry: {{Industry}}
- Country: {{Country}}
- Exchange: {{Exchange}}
- CIK: {{CIK}}

## Key Metrics
- 52-Week High: {{52WeekHigh}}
- 52-Week Low: {{52WeekLow}}
- Market Cap: {{MarketCapitalization}}
- Shares Outstanding: {{SharesOutstanding}}
- Shares Float: {{SharesFloat}}
- Book Value: {{BookValue}}
- Revenue (TTM): {{RevenueTTM}}
- Revenue Per Share (TTM): {{RevenuePerShareTTM}}
- Gross Profit (TTM): {{GrossProfitTTM}}
- EBITDA: {{EBITDA}}
- EPS: {{EPS}}
- Diluted EPS (TTM): {{DilutedEPSTTM}}
- Profit Margin: {{ProfitMargin}}
- Operating Margin (TTM): {{OperatingMarginTTM}}
- Return on Assets (TTM): {{ReturnOnAssetsTTM}}
- Return on Equity (TTM): {{ReturnOnEquityTTM}}
- Trailing PE: {{TrailingPE}}
- Forward PE: {{ForwardPE}}
- PEG Ratio: {{PEGRatio}}
- Price to Book Ratio: {{PriceToBookRatio}}
- Price to Sales Ratio (TTM): {{PriceToSalesRatioTTM}}
- EV to EBITDA: {{EVToEBITDA}}
- EV to Revenue: {{EVToRevenue}}
- Beta: {{Beta}}
- Fiscal Year End: {{FiscalYearEnd}}
- Latest Quarter: {{LatestQuarter}}
- Quarterly Earnings Growth YOY: {{QuarterlyEarningsGrowthYOY}}
- Quarterly Revenue Growth YOY: {{QuarterlyRevenueGrowthYOY}}
- Analyst Target Price: {{AnalystTargetPrice}}
- Analyst Rating Strong Buy: {{AnalystRatingStrongBuy}}
- Analyst Rating Buy: {{AnalystRatingBuy}}
- Analyst Rating Hold: {{AnalystRatingHold}}
- Analyst Rating Sell: {{AnalystRatingSell}}
- Analyst Rating Strong Sell: {{AnalystRatingStrongSell}}
- Dividend Per Share: {{DividendPerShare}}
- Dividend Yield: {{DividendYield}}
- Dividend Date: {{DividendDate}}
- Ex-Dividend Date: {{ExDividendDate}}
- Percent Insiders: {{PercentInsiders}}
- Percent Institutions: {{PercentInstitutions}}
- Currency: {{Currency}}
- Last Updated: {{last_updated}}

## News Headlines
{{news_with_urls}}

## SEC Filings Table
{{sec_filings_table}}

## Reddit Sentiment
{{reddit_sentiment}}
"""


def build_stock_prompt(
    *,
    docs: List[Dict],  # matches list from Pinecone or other source
    question: str,
    style: str = "markdown",
    model_role: str | None = None,
) -> str:
    """Build a structured prompt for stock analysis.

    Parameters
    ----------
    docs
        List of document dicts - each must have at least a ``metadata`` field.
    question
        The user question to be answered.
    style
        Desired answer style (``markdown``, ``bullets`` or ``json``).  This is
        *not* enforced here - the caller includes it in the instruction.
    model_role
        Optional custom system role.  Defaults to a seasoned equity analyst.
    """

    if model_role is None:
        model_role = (
            "You are a seasoned equity research analyst. Provide concise, "
            "actionable insights for retail investors. Use plain English, "
            "avoid jargon."
        )

    # Build context as Markdown table for key metrics, bullets for others
    def _as_table(meta: dict) -> str:
        keys = [
            "52WeekHigh", "52WeekLow", "DividendYield", "ForwardPE", "PEGRatio", "PriceToBookRatio", "TrailingPE"
        ]
        header = "| " + " | ".join(keys) + " |"
        sep = "|" + "---|" * len(keys)
        row = "| " + " | ".join(str(meta.get(k, "-")) for k in keys) + " |"
        return f"\n{header}\n{sep}\n{row}\n"

    context_blocks: List[str] = []
    for doc in docs:
        meta = doc.get("metadata", {})
        filtered = _filter_metadata(meta)
        if not filtered:
            continue
        # Overview bullets, each on its own line
        overview_keys = ["Name", "symbol", "Sector", "Industry", "MarketCapitalization"]
        overview = "\n".join([
            f"- **{k}**: {filtered.get(k, '-')}" for k in overview_keys if k in filtered
        ])
        # Table for metrics
        table = _as_table(filtered)
        # Analyst sentiment, each on its own line
        sentiment = "\n".join([
            f"- **StrongBuy**: {filtered.get('AnalystRatingStrongBuy', '-')}\n",
            f"- **Buy**: {filtered.get('AnalystRatingBuy', '-')}\n",
            f"- **Hold**: {filtered.get('AnalystRatingHold', '-')}\n",
            f"- **Sell**: {filtered.get('AnalystRatingSell', '-')}\n",
            f"- **StrongSell**: {filtered.get('AnalystRatingStrongSell', '-')}\n"
        ])
        context_blocks.append(
            f"\n## Overview\n{overview}\n\n## Key Metrics\n{table}\n\n## Analyst Sentiment\n{sentiment}\n"
        )

    context_str = "\n\n---\n\n".join(context_blocks) if context_blocks else "(no metadata)"

    instruction_map = {
        "markdown": (
            "You MUST copy the following sample format EXACTLY. Do not invent your own structure. Only use Markdown headings, bullet points, and tables as shown. Do NOT use dashes or run-on text.\n\n"
            "Sample output (copy this format):\n"
            "**Summary:** Apple Inc. (AAPL) is a leading technology company...\n\n"
            "## Overview\n"
            "- **Name**: Apple Inc.\n"
            "- **Symbol**: AAPL\n"
            "- **Sector**: Technology\n"
            "- **Industry**: Electronic Computers\n"
            "- **Market Capitalization**: $2.94 trillion\n\n"
            "## Key Metrics\n"
            "| 52-Week High | 52-Week Low | Dividend Yield | Forward PE | PEG Ratio | Price to Book Ratio | Trailing PE |\n"
            "|-------------|-------------|---------------|------------|-----------|---------------------|-------------|\n"
            "| $259.47     | $168.99     | 0.53%         | 24.45      | 1.77      | 43.75               | 30.48       |\n\n"
            "## Analyst Sentiment\n"
            "- **StrongBuy**: 7\n"
            "- **Buy**: 21\n"
            "- **Hold**: 16\n"
            "- **Sell**: 2\n"
            "- **StrongSell**: 1\n\n"
            "## Risks\n"
            "- Market volatility can impact stock price.\n"
            "- Competition in the technology sector.\n"
            "- Changes in consumer preferences could impact product demand.\n\n"
            "You MUST use the same headings, table, and bullet structure. Do NOT use any other format.\n"
        ),
        "bullets": "Answer in short, clear bullet points for each section.",
        "json": "Respond with a JSON object containing keys: overview, metrics, sentiment, risks.",
    }
    instruction = instruction_map.get(style, instruction_map["markdown"])

    template = textwrap.dedent(
        f"""
        <system>\n{model_role}\n</system>\n\n<context>\n{context_str}\n</context>\n\nUser question: {question}\n\n{instruction}\n"""
    ).strip()

    return template 

def build_news_with_urls_markdown(news_items):
    """Build markdown list of news items with clickable URLs and proper formatting."""
    if not news_items:
        return "No recent news found."
    
    md_lines = []
    for item in news_items:
        title = item.get("title", "")
        url = item.get("url", "")
        source = item.get("source", "")
        published_at = item.get("published_at", "")
        
        if not title:
            continue
            
        # Format the news item with proper markdown
        if url:
            # Create clickable link with bold title
            md_lines.append(f"- **[{title}]({url})**")
        else:
            # Just bold title if no URL
            md_lines.append(f"- **{title}**")
        
        # Add source and date if available
        metadata = []
        if source:
            metadata.append(f"Source: {source}")
        if published_at:
            metadata.append(f"Published: {published_at}")
        
        if metadata:
            md_lines.append(f"  ({', '.join(metadata)})")
    
    return "\n".join(md_lines) if md_lines else "No recent news found."

def build_reddit_sentiment_markdown(reddit_data):
    """Build markdown table for Reddit sentiment with detailed information."""
    if not reddit_data or isinstance(reddit_data, str):
        return "No Reddit sentiment data available."
    
    if "error" in reddit_data:
        return f"Reddit sentiment error: {reddit_data['error']}"
    
    sentiment_summary = reddit_data.get("sentiment_summary", {})
    posts = reddit_data.get("posts", [])
    total_posts = reddit_data.get("total_posts_analyzed", len(posts))
    
    if not sentiment_summary:
        return "No Reddit sentiment data available."
    
    # Build sentiment summary with better formatting
    md_lines = []
    
    positive = sentiment_summary.get("positive", 0)
    neutral = sentiment_summary.get("neutral", 0)
    negative = sentiment_summary.get("negative", 0)
    
    # Add total post count
    md_lines.append(f"**Total Posts Analyzed**: {total_posts}")
    md_lines.append("")
    
    # Format as bullet points instead of table
    md_lines.append(f"- **Positive**: {positive:.1%}")
    md_lines.append(f"- **Neutral**: {neutral:.1%}")
    md_lines.append(f"- **Negative**: {negative:.1%}")
    
    # Add sentiment interpretation
    total = positive + neutral + negative
    if total > 0:
        dominant_sentiment = max(sentiment_summary.items(), key=lambda x: x[1])[0]
        sentiment_percentage = sentiment_summary[dominant_sentiment] * 100
        
        md_lines.append(f"\n**Overall Sentiment**: {dominant_sentiment.title()} ({sentiment_percentage:.1f}%)")
        
        # Add top posts if available
        if posts:
            md_lines.append(f"\n**Top Posts**:")
            for i, post in enumerate(posts[:3], 1):
                title = post.get("title", "")[:80] + "..." if len(post.get("title", "")) > 80 else post.get("title", "")
                sentiment = post.get("sentiment", "neutral")
                score = post.get("score", 0)
                engagement = post.get("engagement_score", 0)
                url = post.get("url", "")
                
                # Create clickable link if URL is available
                if url:
                    md_lines.append(f"{i}. **[{title}]({url})** ({sentiment}, score: {score}, engagement: {engagement:.1f})")
                else:
                    md_lines.append(f"{i}. **{title}** ({sentiment}, score: {score}, engagement: {engagement:.1f})")
    
    return "\n".join(md_lines)

def build_sec_filing_summary_markdown(symbol, filings):
    if not filings:
        return f"### SEC Filings for {symbol}\nNo recent filings found."

    md = f"### SEC Filings for {symbol}\n\n"
    md += "| Date/File | Type | Summary/Preview |\n|---|---|---|\n"
    for filing in filings:
        # Use available fields, fallback to alternatives
        date_or_file = filing.get('date') or filing.get('file_path', '')
        type_ = filing.get('type') or filing.get('filing_type', '')
        summary = filing.get('summary') or filing.get('content_preview', '')
        # If all are empty, skip the row
        if not (date_or_file or type_ or summary):
            continue
        md += f"| {date_or_file} | {type_} | {summary} |\n"
    # If no rows were added, show a message
    if md.strip().endswith('|---|---|---|'):
        md += "| No filings with displayable metadata found. | | |\n"
    return md 