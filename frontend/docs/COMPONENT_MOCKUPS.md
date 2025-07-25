# UI Component Mockups & Wireframes

_Parent documents: [COLOR_SYSTEM.md](./COLOR_SYSTEM.md), [../../PLANNING.md]_  

This document provides ASCII wireframes and usage notes for the new reusable UI components required for the advanced chat and stock analysis features.

---

## Table Component

**Purpose:** Display key metrics, news lists, or batch analysis in a clean, responsive table.

**Wireframe:**
```
+----------------+----------+----------+----------+----------+
| Metric         | Value    | 1D High  | 1D Low   | 52W High |
+----------------+----------+----------+----------+----------+
| Price          | $123.45  | $125.00  | $120.00  | $180.00  |
| Volume         | 1.2M     |          |          |          |
| Market Cap     | $500B    |          |          |          |
+----------------+----------+----------+----------+----------+
```

**Usage Notes:**
- Use `bg-card-background` for table background, `text-primary-text` for headings, `text-foreground` for cells.
- Responsive: horizontal scroll on mobile.
- Optional: highlight rows/cells based on value (e.g., green/red for positive/negative).

---

## Card Component

**Purpose:** Display news headlines, sentiment summaries, SEC filing summaries, or any "info block" in a visually distinct way.

**Wireframe:**
```
+---------------------------------------------------+
| [icon]  News Headline                            |
|         Short summary or excerpt                 |
|         [timestamp]                              |
+---------------------------------------------------+
| [icon]  Sentiment: Positive                      |
|         "Market is bullish on TSLA"              |
+---------------------------------------------------+
```

**Usage Notes:**
- Use `bg-card-background` and `border-border`.
- Title in `text-primary-text`, body in `text-foreground`.
- Optional icon and variant for color accent (e.g., sentiment: positive/negative).

---

## ChartWrapper Component

**Purpose:** Encapsulate chart rendering (e.g., price, trend, prediction) using a pluggable charting library.

**Wireframe:**
```
+---------------------------------------------------+
|   [Title: TSLA Price Chart]                       |
|   +-------------------------------------------+   |
|   |                                           |   |
|   |         (Line/Bar/Candlestick Chart)      |   |
|   |                                           |   |
|   +-------------------------------------------+   |
+---------------------------------------------------+
```

**Usage Notes:**
- Use `bg-card-background` and `border-border`.
- Title in `text-primary-text`.
- Chart area responsive, with padding.
- Chart type (line, bar, candlestick) is configurable.

---

For color and style guidance, see [COLOR_SYSTEM.md](./COLOR_SYSTEM.md).
For implementation plan and context, see [../../PLANNING.md]. 