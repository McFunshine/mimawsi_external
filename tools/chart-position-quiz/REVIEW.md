# Chart Position quiz — review

**Published:** 2026-09-27 · **Approved by:** an approver · **Record written:** automatically, on publish

## What was changed

The published file is the submitted document with the Content-Security-Policy
inserted as the first child of `<head>`, and any policy the file declared for
itself removed. Publication is a parse-and-re-emit, so the document shell is
re-serialised: whitespace between `<!doctype>`, `<html>` and `<head>` is
collapsed, the newline after `</html>` is dropped, and bare boolean attributes
are written out in full (`checked` becomes `checked=""`). Nothing in the
markup, the styles or the script is altered.

## What the approver said

Nothing was written when this was approved. The automated checks below are
therefore the whole of the account, and no human commentary should be inferred
from their absence.

## What was checked

The scanner in `checks/` runs over this file on every change to this repository,
and it ran on the commit that added it. It looks for credentials, personal data,
any means of reaching the network, and that the policy is exactly the published
one — and it fails hard, with no allowlist.

## How to check it yourself

```sh
shasum -a 256 tools/chart-position-quiz/tool.html
curl -s https://www.mimawsi.com/tools/365bce65-afc3-46e7-8f54-be46df2fe49f.html | shasum -a 256
```

Both must print `c1d25116160f2246ec0bf1a54dbd2d9e113bbef29347a8bfd2b8fe975b67e757`.
