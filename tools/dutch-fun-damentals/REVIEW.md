# Dutch fun(damentals) — review

**Published:** 2026-09-29 · **Approved by:** Paul Spencer · **Record written:** automatically, on publish

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
shasum -a 256 tools/dutch-fun-damentals/tool.html
curl -s https://www.mimawsi.com/tools/8cf6215a-259c-42b0-bebe-02689b49864f.html | shasum -a 256
```

Both must print `61cc5dfe2a8aa7d7b73d0feed5af2016251614304e45c8f5371ab8af6626f6bb`.
