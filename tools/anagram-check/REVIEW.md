# Anagram Check — review

**Published:** 2026-09-05 · **Reviewed by:** operator · **Record written:** 2026-09-05

## What it does

Compares two phrases and says whether they are made of the same letters, with a
per-letter table showing the count on each side and the difference. Two toggles
control the comparison: ignoring spaces and punctuation, and ignoring capitals.
Normalisation is Unicode-aware — `NFKD` then combining marks stripped, so
accented letters fold to their base — and the letter filter uses
`\p{L}`/`\p{N}` rather than `A–Z`, which means it behaves sensibly well
outside English.

## What was changed

Nothing by hand. The published file is the submitted document with the
Content-Security-Policy meta tag inserted as the first child of `<head>`, and
any policy the file declared for itself removed. 5150 bytes in, 5302 out.

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

This tool was submitted through the site's Google sign-in path rather than by
the operator on the command line. That is all the record shows: the store keeps
a Google subject identifier, which is not published here, and it does not
establish that the submitter is unconnected to the project. Nobody outside has
been asked to vouch for it.

This folder was reconstructed on 2026-09-05 from the bytes the site was actually
serving, some hours after the tool was published — this repository was five
tools behind, and this is one of the five. The file is the published file and
the hash was taken from it, so the verification the README describes holds. What
is *not* claimed is that this note was written at the moment of review; it was
not.
