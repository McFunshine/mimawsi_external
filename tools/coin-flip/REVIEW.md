# Coin Flip — review

**Submitted:** 2026-08-23 · **Published:** 2026-08-23 · **Reviewed by:** operator

## What it does

Shows a button. Clicking it prints "Heads" or "Tails" from `Math.random()`.

## What was changed

Nothing in the markup or the script. The published file differs from the
submitted one by exactly one addition: the Content-Security-Policy meta tag,
inserted into `<head>` by the platform at publish time. 285 bytes in, 433 out.

## What was checked

- No credentials, personal data or payment numbers.
- No way to reach the network: no `fetch`, no `XMLHttpRequest`, no remote assets.
  Everything it needs is in the file.
- No storage. It keeps no state between clicks and writes nothing to the browser.
- The policy is the published one, unmodified.

## Honest note

This tool was written by the operator as the first thing to travel the upload
path end to end, not submitted by a member of the public. It is a real published
tool and is reviewed as one, but nobody outside the project vouched for it.
