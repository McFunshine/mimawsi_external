# Which Invoices Add Up — review

**Published:** 2026-09-06 · **Approved by:** Paul Spencer · **Record written:** automatically, on publish

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
shasum -a 256 tools/which-invoices-add-up/tool.html
curl -s https://www.mimawsi.com/tools/974558b5-0ed6-4f2d-ae48-31797c7af30a.html | shasum -a 256
```

Both must print `1ac088627527fb2a06ee1eec3a327e50c72677b69922b98862d45fdb3ab4bd8f`.
