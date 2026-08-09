# Beta Validation Strategy

## Audience and problem

Recruit actual followers of US equities who currently switch between multiple apps, company pages, and news sources. Observe their existing workflow before showing MarketBrief.

The core qualitative question is: **“Did MarketBrief tell you something useful you otherwise would have had to search for?”**

A strong signal is “I checked MarketBrief instead of checking multiple apps.” “Looks nice” is a weak signal.

## Product metrics

- users who add at least five stocks;
- Today opens and material changes viewed;
- Why It Moved, evidence, and source opens;
- brief opens and Ask submissions;
- D1, D3, and D7 return;
- helpful/not-helpful feedback by task and structured reason.

Events must use the privacy allowlist. Never store raw questions, full thesis text, article bodies, credentials, or device fingerprints.

## Study flow

1. Baseline interview and current-workflow observation.
2. Unassisted onboarding and five-stock setup.
3. Five-second Today comprehension test: “What changed in your stocks?”
4. Follow one material item into Why, evidence, and original source.
5. Test zero-change, one-change, stale, partial-provider, offline, and AI-unavailable states.
6. Test Briefs and one scoped Ask task.
7. Return interviews on D1, D3, and D7.

## Device matrix

- Small Android phone and representative current Android phone.
- iPhone reference size.
- 15-stock watchlist, long company names, large font scaling, screen reader, keyboard, back gesture, resume, offline/slow network, rotation where supported, and deep links.

Record whether a physical device, emulator, web viewport, or static review was used. Never describe one as another.

## Decision gate

Proceed toward M8/M9 only if users repeatedly understand the “since last checked” value, trust source transparency, and replace part of an existing research habit. Fix trust, relevance, or reliability failures before adding breadth.
