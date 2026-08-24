import { describe, expect, it } from 'vitest';
import { REQUIRED_CSP, checkPolicy, scan } from './scan.ts';

const wrap = (body: string) =>
  `<!DOCTYPE html><html lang="en"><head><meta http-equiv="Content-Security-Policy" content="${REQUIRED_CSP}"><title>T</title></head><body>${body}</body></html>`;

const rules = (html: string) => scan(html).map((f) => f.rule);

describe('the checks themselves', () => {
  it('passes a clean, self-contained tool', () => {
    expect(scan(wrap('<h1>Hi</h1><script>document.title="x"</script>'))).toEqual([]);
  });

  describe('credentials', () => {
    // Each of these, committed here, would be published permanently.
    it.each([
      ['an AWS key', 'const k = "AKIAIOSFODNN7EXAMPLE"', 'secret/aws-access-key'],
      ['a Google key', 'const k = "AIzaSyA012345678901234567890123456789ab"', 'secret/google-api-key'],
      ['a GitHub token', 'const t = "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"', 'secret/github-token'],
      ['a Stripe key', 'const s = "sk_live_ABCDEFGHIJKLMNOP1234"', 'secret/stripe-key'],
      ['a private key', '-----BEGIN RSA PRIVATE KEY-----', 'secret/private-key'],
      ['an assigned password', 'const password = "hunter2hunter2hunter2"', 'secret/assigned-credential'],
    ])('catches %s', (_label, code, rule) => {
      expect(rules(wrap(`<script>${code}</script>`))).toContain(rule);
    });
  });

  describe('personal data', () => {
    it('catches an email address', () => {
      expect(rules(wrap('<p>ask me at someone@example.com</p>'))).toContain('pii/email');
    });

    it('catches a card number, by Luhn rather than by length', () => {
      expect(rules(wrap('<p>4242 4242 4242 4242</p>'))).toContain('pii/card-number');
    });

    it('does not flag a long number that is not a card', () => {
      // The check has to be quiet on ordinary data or reviewers learn to ignore it.
      expect(rules(wrap('<p>1234567890123456</p>'))).not.toContain('pii/card-number');
    });

    it('does not flag a phone number, which is deliberate', () => {
      expect(rules(wrap('<p>call 555 0134</p>'))).toEqual([]);
    });
  });

  describe('reaching the network', () => {
    it.each([
      ['fetch', 'fetch("/x")', 'network/fetch'],
      ['XHR', 'new XMLHttpRequest()', 'network/xhr'],
      ['a WebSocket', 'new WebSocket("wss://x")', 'network/websocket'],
      ['sendBeacon', 'navigator.sendBeacon("/x")', 'network/beacon'],
    ])('catches %s', (_label, code, rule) => {
      expect(rules(wrap(`<script>${code}</script>`))).toContain(rule);
    });

    it('catches a remote script or image', () => {
      expect(rules(wrap('<img src="https://example.com/pixel.gif">'))).toContain(
        'network/remote-asset',
      );
    });

    it('allows a data: image, which the policy permits', () => {
      expect(rules(wrap('<img src="data:image/gif;base64,R0lGOD">'))).toEqual([]);
    });
  });

  describe('the policy', () => {
    it('rejects a tool with no policy at all', () => {
      expect(checkPolicy('<html><head></head><body></body></html>').map((f) => f.rule)).toEqual([
        'policy/missing',
      ]);
    });

    it('rejects a policy that is not the published one', () => {
      // A tool that widened its own policy would be served with that widening.
      const weakened = REQUIRED_CSP.replace("default-src 'none'", "default-src *");
      const html = `<head><meta http-equiv="Content-Security-Policy" content="${weakened}"></head>`;
      expect(checkPolicy(html).map((f) => f.rule)).toEqual(['policy/unexpected']);
    });

    it('accepts the published policy exactly', () => {
      expect(checkPolicy(wrap(''))).toEqual([]);
    });
  });

  it('reports the line, so a reviewer can go and look', () => {
    const [finding] = scan(`<html>\n<head></head>\n<body>a@b.co</body>\n</html>`);
    expect(finding?.line).toBe(3);
  });
});
