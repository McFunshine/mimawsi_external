import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { scan } from './scan.ts';

/**
 * Every tool in the repository, checked.
 *
 * Discovered from the directory rather than listed, so adding a tool cannot
 * quietly skip review: a new folder is a new set of failing-or-passing checks
 * whether or not anyone remembered to register it.
 */
const TOOLS = join(import.meta.dirname, '..', 'tools');

const slugs = existsSync(TOOLS)
  ? readdirSync(TOOLS, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort()
  : [];

interface Meta {
  id: string;
  title: string;
  description: string;
  sha256: string;
}

describe.each(slugs)('tools/%s', (slug) => {
  const dir = join(TOOLS, slug);
  const html = readFileSync(join(dir, 'tool.html'), 'utf8');
  const meta = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8')) as Meta;

  it('carries nothing it should not: no credentials, no personal data, no network', () => {
    const findings = scan(html);
    // Printed in full rather than counted, because the useful output of a failure
    // is what was found and where, not that something was.
    const report = findings.map((f) => `  line ${f.line}  ${f.rule}: ${f.detail}`).join('\n');
    expect(findings, `\n${slug} has ${findings.length} finding(s):\n${report}\n`).toEqual([]);
  });

  it('records the hash of the bytes it actually contains', () => {
    // meta.sha256 is what the publisher compares against before uploading, and
    // what a reader compares against the live file. If it drifts from the file
    // beside it, every downstream comparison is meaningless.
    expect(createHash('sha256').update(html).digest('hex')).toBe(meta.sha256);
  });

  it('describes itself well enough to appear in the catalogue', () => {
    expect(meta.id).toMatch(/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/);
    expect(meta.title.trim()).not.toBe('');
    expect(meta.description.trim()).not.toBe('');
  });

  it('has a review note saying what was changed and why', () => {
    // The audit trail is the point of this repository. A tool with no account of
    // its review has not been reviewed in any way a reader can check.
    const notes = readFileSync(join(dir, 'REVIEW.md'), 'utf8');
    expect(notes.trim().length).toBeGreaterThan(80);
  });
});

it('has at least one tool, so an empty run cannot look like a passing one', () => {
  expect(slugs.length).toBeGreaterThan(0);
});
