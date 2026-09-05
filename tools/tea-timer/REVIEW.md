# Tea Timer — review

**Published:** 2026-09-05 · **Reviewed by:** operator · **Record written:** 2026-09-05

## What it does

Five preset steeping times — green, black, oolong, herbal, white — as a row of
buttons. Picking one sets the clock; start and pause count it down with
`setInterval`, and reset returns it to the chosen tea's time. At zero it stops
itself and says so. The clock is a `role="timer"` with `aria-live="polite"`
and the tea buttons carry `aria-pressed`, so the state is available to a screen
reader rather than only to the eye.

## What was changed

Nothing by hand. The published file is the submitted document with the
Content-Security-Policy meta tag inserted as the first child of `<head>`, and
any policy the file declared for itself removed. 3808 bytes in, 3954 out.

Publication is a parse-and-re-emit (parse5), not a string insertion — see
RULE-45 and `packages/injector` — so the bytes also differ in ways that are the
serialiser's doing rather than anyone's edit: the whitespace between
`<!doctype>`, `<html>` and `<head>` is collapsed, and the newline after
`</html>` is dropped.

## What was checked

The repository's own scanner (`checks/scan.ts`) runs over this file on every
change and reports nothing:

- No credentials — no AWS, Google, GitHub, Stripe or OpenAI keys, no private key
  block, no JWT, nothing assigned to a password- or token-shaped name.
- No personal data — no email addresses, no IBANs, no numbers passing a Luhn check.
- No way to reach the network — no `fetch`, no `XMLHttpRequest`, no
  `WebSocket`, no `EventSource`, no `sendBeacon`, no remote scripts or images.
  Everything it needs is in the file.
- The Content-Security-Policy is present and is exactly the published one.
- `meta.json` matches the sha256 of the bytes beside it.

## Honest note

This tool was written by the operator, not submitted by a member of the public.
It is a real published tool and is reviewed as one, but nobody outside the
project vouched for it.

This folder was reconstructed on 2026-09-05 from the bytes the site was actually
serving, some hours after the tool was published — this repository was five
tools behind, and this is one of the five. The file is the published file and
the hash was taken from it, so the verification the README describes holds. What
is *not* claimed is that this note was written at the moment of review; it was
not.
