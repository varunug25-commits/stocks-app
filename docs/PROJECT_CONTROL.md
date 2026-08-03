# Signal Mobile — Project Control

## Product goal

Signal is a calm, mobile-first market companion that helps an everyday investor understand what matters today. The first release is a polished native design shell built with realistic local mock data.

## Current phase

**Phase 1: Mobile foundation and Today screen**

This phase delivers:

- Expo and React Native foundation for iOS and Android;
- Expo Router navigation with a bottom tab bar;
- the dark Signal design system;
- reusable finance-feed components;
- a polished, scrollable Today screen; and
- local mock data and interaction states.

## Explicitly out of scope

Do not add these until a later approved phase:

- authentication or user accounts;
- Supabase or any other database;
- external market, news, logo, or media APIs;
- AI model calls or generated analysis;
- brokerage connections, trading, or payments;
- push notifications; and
- production subscriptions.

Mock AI copy is presentation data only and must be clearly identified in code as mock content.

## Delivery sequence

1. Product-control documents
2. Expo application shell and navigation
3. Shared theme tokens and primitives
4. Today screen with realistic local data
5. Loading, empty, modal, and bottom-sheet states
6. iOS and Android visual QA
7. Stable shell checkpoint before any data integration

## Quality gates

Every milestone must pass:

- TypeScript with no errors;
- lint with no errors;
- available automated tests;
- Expo dependency compatibility checks; and
- a successful Metro development-server start.

Before any future API phase, the complete mobile shell must also be reviewed on at least one iPhone simulator and one Android emulator or physical device.

## Branch and release policy

- `main` remains stable and shippable.
- Each major phase uses a `codex/` feature branch.
- Commits represent small working milestones.
- Feature branches are pushed to GitHub for backup and review.
- No feature merges until all quality gates pass.

## Source of truth

When requirements disagree, use this priority:

1. The latest direct user instruction
2. `AGENTS.md`
3. This project-control document
4. The design-system and architecture documents
5. Existing implementation details

