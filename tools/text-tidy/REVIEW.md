# Text Tidy — review

**Published:** 2026-09-05 · **Reviewed by:** operator · **Record written:** 2026-09-05

## What it does

Eleven text transformations over a paste box: collapse spacing, replace curly
quotes and dashes with ASCII, sentence case, title case, upper, lower, a URL
slug, remove line breaks, sort lines, remove duplicate lines, and reverse. The
result lands in a second box with a word, character and line count, and can be
fed back as input to chain transformations. Title case keeps a list of small
words lowercase unless they lead.

## What was changed

Nothing by hand. The published file is the submitted document with the
Content-Security-Policy meta tag inserted as the first child of `<head>`, and
any policy the file declared for itself removed. 5312 bytes in, 5461 out.

Publication is a parse-and-re-emit (parse5), not a string insertion — see
RULE-45 and `packages/injector` — so the bytes also differ in ways that are the
serialiser's doing rather than anyone's edit: the whitespace between
`<!doctype>`, `<html>` and `<head>` is collapsed, and the newline after
`</html>` is dropped.

Bare boolean attributes are also written out in full: `checked` becomes
`checked=""`, `readonly` becomes `readonly=""`. Same meaning to a browser;
different bytes.

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
