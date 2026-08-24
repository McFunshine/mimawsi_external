# mimawsi — published tools

Every tool published on [mimawsi.com](https://www.mimawsi.com) lives here, one
folder each, in the exact form the site serves it.

This repository exists so you do not have to take our word for anything. The
tools are small, they are readable, and the checks they passed are in here next
to them and run on every change.

## What is in a folder

```
tools/coin-flip/
  tool.html    the tool, byte for byte what the site serves
  meta.json    id, title, description, and the sha256 of tool.html
  REVIEW.md    what was changed and why, and what was checked
  tests/       anything specific to this tool
```

## Checking it yourself

The claim is that `tool.html` here is exactly the file the site serves. You can
check that without trusting us:

```sh
shasum -a 256 tools/coin-flip/tool.html
curl -s https://www.mimawsi.com/tools/aa294dda-569e-4c0a-b1ca-bb23e8c3002e.html | shasum -a 256
```

Those two hashes must match. If they ever do not, something is wrong and we would
like to know.

To run the checks:

```sh
npm install && npm test
```

## What the checks look for

Every tool, on every change, automatically — a new folder is discovered rather
than registered, so a tool cannot be added without being checked.

| | |
|---|---|
| **Credentials** | AWS, Google, GitHub, Stripe, OpenAI keys, private keys, JWTs, anything assigned to a password- or token-shaped name |
| **Personal data** | Email addresses, IBANs, and numbers that pass a Luhn check |
| **Network access** | `fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, remote scripts and images |
| **The policy** | The Content-Security-Policy is present and is exactly the published one |
| **The hash** | `meta.json` matches the bytes of `tool.html` beside it |
| **The account** | `REVIEW.md` exists and says something |

The checks fail hard and there is no allowlist. A tool that needs an exception is
a conversation in a pull request, not a flag somebody sets quietly.

## What is not stored here

**The original submission.** Only the reviewed file is committed, never the file
as it arrived. If a submission contains an API key or someone's email address,
committing it here would publish that permanently — git history is not something
a later commit undoes. The scrub happens before the first commit, so it happens
before anything is public.

That means this repository is not a record of what people wrote. It is a record
of what was published, which is the thing that needs to be auditable.

## Why the tools are the way they are

Every tool is a single HTML file with no network access, so it runs identically
whether you use it on the site or download it and open it offline. That is the
promise, and the checks in here are how it is kept.
