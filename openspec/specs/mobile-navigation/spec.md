# Mobile Navigation Specification

## Purpose

Define responsive hamburger menu behavior for mobile viewports. Desktop navigation (md+) remains unchanged.

## Requirements

### Requirement: SPEC-NAV-01 — Hamburger Toggle

The Header MUST render a hamburger button visible on mobile (< md breakpoint) and hidden on md+ screens.

#### Scenario: Visible on mobile

- GIVEN viewport is < 768px
- WHEN rendering Header
- THEN a hamburger icon button is visible

#### Scenario: Hidden on desktop

- GIVEN viewport is >= 768px
- WHEN rendering Header
- THEN hamburger button is not rendered

### Requirement: SPEC-NAV-02 — Drawer Navigation

Tapping the hamburger MUST open a slide-in drawer with navigation links (Home, Cart, Login/Logout). The drawer MUST slide in from the left with smooth CSS animation.

#### Scenario: Opens on tap

- GIVEN hamburger is visible
- WHEN user taps the hamburger button
- THEN drawer slides in from the left
- AND nav links (Home, Cart, user-dependent Login/Logout) are visible

#### Scenario: Closes on link click

- GIVEN drawer is open
- WHEN user taps a navigation link
- THEN drawer slides out
- AND navigation occurs

### Requirement: SPEC-NAV-03 — Drawer Dismissal

The drawer MUST close when: (a) user taps a nav link, (b) user clicks/taps outside the drawer, (c) user presses Escape key.

#### Scenario: Closes on outside click

- GIVEN drawer is open
- WHEN user clicks outside the drawer area
- THEN drawer slides out

#### Scenario: Closes on Escape

- GIVEN drawer is open
- WHEN user presses Escape key
- THEN drawer slides out

### Requirement: SPEC-NAV-04 — Accessibility

The hamburger button and drawer MUST use proper ARIA attributes. Focus MUST be trapped inside the drawer when open and restored to the toggle when closed.

#### Scenario: ARIA attributes present

- GIVEN hamburger button is rendered
- THEN it has `aria-label`, `aria-expanded`, and `aria-controls` attributes
- AND the drawer has `role="navigation"` and `aria-label`

#### Scenario: Focus management

- GIVEN drawer is open
- WHEN tabbing through interactive elements
- THEN focus cycles within the drawer
- AND closing the drawer restores focus to hamburger button
