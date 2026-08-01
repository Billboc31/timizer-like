# T069 — Add persistent navigation back to the home page

**Source**: GitHub Issue #140

## Description

## Objective

Add an obvious and reliable way to return to the Timizer home/annual-calendar page from every application screen.

## Current problem

Some screens do not provide any visible link or action to return to the home page. Users can become trapped in a CRA detail, history, signature-management, or other secondary view and must rely on browser navigation.

## Requirements

- Add a persistent home navigation entry to the application navigation/sidebar.
- Use a clear icon and French label such as `Accueil`.
- Make the Timizer logo/title navigate to the home page when appropriate.
- Keep the home action visible from all authenticated application screens.
- Highlight the home entry when the root/annual-calendar view is active.
- Preserve the current project/user context while navigating home.
- Do not create a new CRA when returning home.
- Ensure browser back/forward navigation remains consistent.
- On mobile, expose the same action in the responsive navigation menu.

## Acceptance criteria

- Every authenticated screen provides a visible route back to the home page.
- Clicking `Accueil` opens the annual calendar dashboard.
- Clicking the application logo also returns home when the logo is displayed as navigation.
- The active navigation state is correct on the home route.
- Returning home does not modify or create CRA data.
- The link is keyboard accessible and has an accessible label.
- Desktop and mobile navigation both expose the action.
