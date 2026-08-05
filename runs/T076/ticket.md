# T076 — Remove persistent non-closable CRA detail panel from all pages

**Source**: GitHub Issue #154

## Description

## Objective

Remove the persistent "Détail CRA" panel that remains visible at the bottom of every page and cannot be closed.

## Problem

A CRA detail window is still rendered globally at the bottom of the application, even when the user has not opened a CRA. It has no working close action and pollutes every page.

## Requirements

- Identify the global component/state responsible for rendering the CRA detail panel.
- Remove the panel from the global layout when no CRA is explicitly opened.
- When CRA details are opened intentionally, display them only in the expected modal, drawer, or dedicated view.
- Provide a working close action whenever a CRA detail view is displayed.
- Ensure closing the detail view clears the related selected-CRA state.
- Ensure navigation between pages does not make the stale panel reappear.

## Acceptance criteria

- No "Détail CRA" panel appears automatically at the bottom of pages.
- The panel is not visible on Home, History, Settings, or CRA creation views unless explicitly opened.
- An intentionally opened CRA detail view can be closed.
- Closing it removes it completely from the DOM or hidden UI state.
- Existing CRA detail access remains functional without regression.
