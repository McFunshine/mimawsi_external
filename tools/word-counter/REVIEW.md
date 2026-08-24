# Word Counter — review

**Published:** 2026-08-22 · **Reviewed by:** operator

## What it does

A textarea. Counts words, characters and lines as you type.

## What was changed

Nothing. This is the project's own seed tool, written before the upload path
existed and committed directly, which is why its id is a name rather than a uuid.

## What was checked

- No credentials, personal data or payment numbers.
- No network access. The text you paste never leaves the page — which is the
  claim its description makes, so it is the claim most worth verifying.
- No storage: nothing is retained after the tab closes.

## Honest note

This tool predates the review process it is now recorded under. It is here so the
repository is a complete account of what the site serves, rather than a partial
one that starts at an arbitrary date.
