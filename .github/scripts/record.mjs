/**
 * Write one tool's folder from the bytes the site is serving.
 *
 * Everything here is derived from the fetched file rather than from the dispatch
 * that triggered it. The payload says *which* tool and what it is called; it does
 * not get to say what the file contains or what its hash is, because a record
 * that takes both the claim and the evidence from the same source checks nothing.
 *
 *   node .github/scripts/record.mjs <payload.json>
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE = process.env.MIMAWSI_SITE ?? 'https://www.mimawsi.com';
const ATTEMPTS = 10;
const WAIT_MS = 6000;

const what = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * A publish invalidates CloudFront and then dispatches, and an invalidation is not
 * instant. A 403 here usually means "not yet" rather than "never", so this waits
 * rather than recording nothing and calling it success.
 */
async function fetchPublished(id) {
  const url = `${SITE}/tools/${id}.html`;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    const response = await fetch(url, { cache: 'no-store' });
    if (response.ok) {
      return Buffer.from(await response.arrayBuffer());
    }
    console.log(`  ${url} -> ${response.status} (attempt ${attempt}/${ATTEMPTS})`);
    if (attempt < ATTEMPTS) {
      await sleep(WAIT_MS);
    }
  }
  throw new Error(`${url} never became reachable; recording nothing`);
}

const bytes = await fetchPublished(what.id);
const html = bytes.toString('utf8');
const sha256 = createHash('sha256').update(bytes).digest('hex');

// The one thing this repository promises is that tool.html here is what the site
// serves. Refusing an empty or obviously wrong file is cheap insurance on that.
if (bytes.length === 0 || !html.includes('Content-Security-Policy')) {
  throw new Error('fetched file is empty or carries no policy; recording nothing');
}

const dir = join('tools', what.slug);
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, 'tool.html'), bytes);
writeFileSync(
  join(dir, 'meta.json'),
  `${JSON.stringify(
    {
      id: what.id,
      slug: what.slug,
      title: what.title,
      description: what.description ?? '',
      tags: [],
      sha256,
      sizeBytes: bytes.length,
    },
    null,
    2,
  )}\n`,
);

const today = new Date().toISOString().slice(0, 10);
const approver = what.approvedBy && what.approvedBy !== '' ? what.approvedBy : 'an approver';

/**
 * The note is the approver's own words, or absent.
 *
 * Nothing here invents an account of a review. A generated paragraph saying what
 * "was checked" would manufacture the exact assurance this repository exists to
 * make checkable, so when no note was written the file says so plainly and the
 * automated findings stand on their own.
 */
const note =
  what.note && what.note.trim() !== ''
    ? `## What the approver said\n\n${what.note.trim()}\n`
    : `## What the approver said\n\nNothing was written when this was approved. The automated checks below are\ntherefore the whole of the account, and no human commentary should be inferred\nfrom their absence.\n`;

writeFileSync(
  join(dir, 'REVIEW.md'),
  `# ${what.title} — review

**Published:** ${today} · **Approved by:** ${approver} · **Record written:** automatically, on publish

## What was changed

The published file is the submitted document with the Content-Security-Policy
inserted as the first child of \`<head>\`, and any policy the file declared for
itself removed. Publication is a parse-and-re-emit, so the document shell is
re-serialised: whitespace between \`<!doctype>\`, \`<html>\` and \`<head>\` is
collapsed, the newline after \`</html>\` is dropped, and bare boolean attributes
are written out in full (\`checked\` becomes \`checked=""\`). Nothing in the
markup, the styles or the script is altered.

${note}
## What was checked

The scanner in \`checks/\` runs over this file on every change to this repository,
and it ran on the commit that added it. It looks for credentials, personal data,
any means of reaching the network, and that the policy is exactly the published
one — and it fails hard, with no allowlist.

## How to check it yourself

\`\`\`sh
shasum -a 256 tools/${what.slug}/tool.html
curl -s ${SITE}/tools/${what.id}.html | shasum -a 256
\`\`\`

Both must print \`${sha256}\`.
`,
);

console.log(`recorded tools/${what.slug} — ${bytes.length} bytes, ${sha256.slice(0, 16)}`);
