# Tip Splitter — review

**Submitted:** 2026-08-23 · **Published:** 2026-08-23 · **Reviewed by:** operator

## What it does

Two number fields, bill and people. Prints the per-person share with 10% added.
Recalculates on input.

## What was changed

Nothing but the Content-Security-Policy meta tag, added at publish time.

## What was checked

- No credentials, personal data or payment numbers. It handles amounts of money
  but stores and transmits none of them — the arithmetic happens in the page and
  the result is written to the DOM.
- No network access of any kind.
- Division by zero is handled: with zero people it prints a dash rather than
  `Infinity`.

## Honest note

Written by the operator to prove the publishing path worked after it was fixed,
not submitted by the public. Reviewed as a real tool nonetheless.
