# T072 — Open CRA details in a shared modal from calendar and history

**Source**: GitHub Issue #143

## Description

## Objective

Open CRA details consistently in a dismissible modal or floating window from both the annual calendar and the history view.

## Current problems

- Clicking a month in the annual calendar navigates into that month's CRA and exposes previous/next CRA navigation at the top, which is unnecessary for this interaction.
- Opening a CRA from History renders the detail underneath the history content instead of as a focused overlay.
- The two entry points use inconsistent presentation and make it difficult to return to the overview.

## Desired behavior

- Clicking a month opens that month's CRA above the annual calendar in a modal or floating detail window.
- Clicking a CRA in History opens the selected CRA through the same reusable modal/floating component.
- The underlying annual calendar or history view remains mounted and visually in place.
- The selected CRA can be closed with:
  - a visible close `×` button;
  - the `Escape` key;
  - browser back when the modal state is represented in the URL;
  - backdrop click only if it cannot discard unsaved changes unexpectedly.
- Remove previous/next CRA navigation from this overlay workflow. The user returns to the overview and selects another CRA.

## Requirements

### Shared CRA overlay

- Create one reusable CRA detail overlay used by calendar and history entry points.
- Display the complete CRA detail and authorized actions without rendering it below the page.
- Preserve the originating view, filters, scroll position, selected year, and history pagination when the overlay closes.
- Prevent background interaction and scrolling while a modal overlay is active.
- Keep header and close controls visible when CRA content scrolls.
- Define a sensible maximum width/height and internal scrolling.
- Use a full-screen dialog or drawer adaptation on small screens.

### Routing and state

- Support direct/deep links to a CRA where existing routes require them.
- Opening and closing the overlay must behave predictably with browser back/forward.
- Refreshing a deep-linked CRA must either restore the overlay over its parent view or show an equivalent standalone detail page with an obvious close/home route.
- Avoid duplicate CRA fetches and stale content when selecting multiple records successively.

### Unsaved changes and accessibility

- If the CRA is editable and contains unsaved changes, closing must request confirmation.
- Focus must move into the dialog when opened and return to the triggering month/history row when closed.
- Use accessible dialog semantics, labelled title, focus trap, and keyboard-operable controls.
- The close button must have an explicit accessible label.

## Acceptance criteria

- Clicking a month opens the corresponding CRA in a modal/floating overlay.
- The annual calendar remains behind the overlay and is restored unchanged on close.
- Clicking a CRA in History uses the same overlay and does not append content below the list.
- No previous/next CRA navigation is displayed in the overlay.
- The overlay closes using the visible cross and Escape.
- Browser back closes an opened overlay without unexpectedly leaving the originating page.
- Closing restores filters, year, scroll position, and keyboard focus.
- Unsaved changes cannot be discarded silently.
- Desktop, tablet, and mobile layouts are usable.
- Automated tests cover both calendar and history entry points, close methods, browser navigation, focus restoration, and unsaved-change protection.
