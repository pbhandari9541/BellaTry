# UI Components Documentation

_Child of [README.md](../README.md)_

This document describes the reusable UI components available in the project. All components use only the semantic color system defined in [COLOR_SYSTEM.md](COLOR_SYSTEM.md).

## Available Components

- [Button](#button)
- [Label](#label)
- [Input](#input)
- [Textarea](#textarea)

---

## Button
Reusable button component. Uses only semantic Tailwind classes from the color system. Supports variants and full accessibility.

## Label
Reusable label component for form fields. Uses only semantic color system.

## Input
Reusable input component for text, email, password, etc. Uses only semantic color system.

## Textarea
Reusable textarea component for multi-line input. Uses only semantic color system.

---

## Watchlist Component (CRUD)

The Watchlist component provides full CRUD (Create, Read, Update, Delete) functionality for managing a user's stock watchlist.

### Features
- **Add**: Users can add a new symbol to their watchlist using the input form.
- **Remove**: Each symbol has a Remove button for deletion, with optimistic UI and error handling.
- **Reorder**: Up/Down buttons allow users to reorder symbols, with optimistic UI and error handling.
- **Loading/Error States**: All states are handled and displayed to the user.

### Usage
- The component uses the `useWatchlist` hook, which provides all CRUD operations and state.
- All API interactions are routed through the backend service layer for maintainability and testability.

### Testing
- All logic is covered by colocated tests in `src/components/watchlist/__tests__/Watchlist.test.tsx`.
- Tests mock the hook and verify UI and interaction logic.

### Related Docs
- See [PLANNING.md](../../PLANNING.md) for the overall frontend plan and goals.
- See [COLOR_SYSTEM.md](COLOR_SYSTEM.md) for design and color usage.

> All components are located in `src/components/ui/`. Only use or extend these for new UI features. 