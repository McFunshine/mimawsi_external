/**
 * What every tool in this repository must satisfy before it is published.
 *
 * These run against the *committed* file, which is the same file the site
 * serves. That is the point of the repository: anyone can read a tool here, run
 * these checks themselves, and compare the bytes to what is live.
 *
 * The checks fail hard. There is no allowlist, deliberately: a tool that needs an
 * exception is a conversation to have in a pull request, not a flag to set. These
 * tools are meant to be small, offline and self-contained, and anything that
 * isn't should have to justify itself in public.
 */

export interface Finding {
  readonly rule: string;
  readonly detail: string;
  /** 1-indexed line, for a reviewer to look at. */
  readonly line: number;
}

const lineOf = (text: string, index: number): number =>
  text.slice(0, index).split('\n').length;

interface Pattern {
  readonly rule: string;
  readonly what: string;
  readonly re: RegExp;
}

/**
 * Credentials. A tool that reaches this repository with a live key publishes that
 * key permanently — GitHub history is not something a later commit can undo — so
 * this is the check that must never be relaxed for convenience.
 */
const SECRETS: readonly Pattern[] = [
  { rule: 'secret/aws-access-key', what: 'an AWS access key id', re: /\bAKIA[0-9A-Z]{16}\b/g },
  { rule: 'secret/google-api-key', what: 'a Google API key', re: /\bAIza[0-9A-Za-z\-_]{35}\b/g },
  { rule: 'secret/slack-token', what: 'a Slack token', re: /\bxox[baprs]-[0-9A-Za-z-]{10,}/g },
  { rule: 'secret/github-token', what: 'a GitHub token', re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/g },
  { rule: 'secret/stripe-key', what: 'a Stripe key', re: /\b[sr]k_(live|test)_[A-Za-z0-9]{16,}\b/g },
  { rule: 'secret/openai-key', what: 'an OpenAI key', re: /\bsk-[A-Za-z0-9]{20,}\b/g },
  { rule: 'secret/private-key', what: 'a private key block', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  { rule: 'secret/jwt', what: 'a JSON Web Token', re: /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\./g },
  {
    rule: 'secret/assigned-credential',
    what: 'something assigned to a key- or token-shaped name',
    re: /\b(api[_-]?key|secret|password|passwd|auth[_-]?token|access[_-]?token)\b\s*[:=]\s*["'`][^"'`\s]{12,}["'`]/gi,
  },
];

/**
 * Personal data. Deliberately narrow: only patterns that are hard to produce by
 * accident. Phone numbers are not here because any string of digits looks like
 * one, and a check that cries wolf gets ignored, which is worse than not running.
 */
const PII: readonly Pattern[] = [
  {
    rule: 'pii/email',
    what: 'an email address',
    re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  },
  { rule: 'pii/iban', what: 'an IBAN', re: /\b[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}\b/g },
];

/**
 * Anything that would let a tool talk to the network. The injected policy already
 * forbids this, so a hit here is usually a tool that will silently not work — but
 * it is also the check that still means something if the policy is ever stripped,
 * which is exactly when it matters most.
 */
const NETWORK: readonly Pattern[] = [
  { rule: 'network/fetch', what: 'a call to fetch()', re: /\bfetch\s*\(/g },
  { rule: 'network/xhr', what: 'an XMLHttpRequest', re: /\bXMLHttpRequest\b/g },
  { rule: 'network/websocket', what: 'a WebSocket', re: /\bWebSocket\s*\(/g },
  { rule: 'network/eventsource', what: 'an EventSource', re: /\bEventSource\s*\(/g },
  { rule: 'network/beacon', what: 'navigator.sendBeacon', re: /\bsendBeacon\s*\(/g },
  {
    rule: 'network/remote-asset',
    what: 'a reference to a remote file',
    re: /\b(?:src|href)\s*=\s*["']https?:\/\//gi,
  },
];

/** Luhn, so a 16-digit number that is not a card number does not fail the run. */
function luhn(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = digits.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

function cardNumbers(html: string): Finding[] {
  const found: Finding[] = [];
  const re = /\b(?:\d[ -]?){13,19}\b/g;
  for (const match of html.matchAll(re)) {
    const digits = match[0].replace(/[ -]/g, '');
    if (digits.length >= 13 && digits.length <= 19 && luhn(digits)) {
      found.push({
        rule: 'pii/card-number',
        detail: 'a number that passes the Luhn check, so it may be a payment card',
        line: lineOf(html, match.index ?? 0),
      });
    }
  }
  return found;
}

const scanFor = (html: string, patterns: readonly Pattern[]): Finding[] =>
  patterns.flatMap((p) =>
    [...html.matchAll(p.re)].map((m) => ({
      rule: p.rule,
      detail: p.what,
      line: lineOf(html, m.index ?? 0),
    })),
  );

/** The policy every published tool carries. Kept here so the check is exact. */
export const REQUIRED_CSP =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:";

export function checkPolicy(html: string): Finding[] {
  // The quote is captured and back-referenced rather than matched as a character
  // class. A class like ["'] with [^"']* between stops at the first quote of any
  // kind — and the policy itself contains 'none', so it captured "default-src "
  // and declared every correctly-policied tool malformed. The check was wrong,
  // not the tools.
  const meta = html.match(
    /<meta\s+http-equiv=(["'])Content-Security-Policy\1\s+content=(["'])(.*?)\2/i,
  );
  if (!meta) {
    return [{ rule: 'policy/missing', detail: 'no Content-Security-Policy meta tag', line: 1 }];
  }
  if (meta[3] !== REQUIRED_CSP) {
    return [
      {
        rule: 'policy/unexpected',
        detail: `policy is not the published one:\n    found:    ${meta[3]}\n    expected: ${REQUIRED_CSP}`,
        line: lineOf(html, meta.index ?? 0),
      },
    ];
  }
  return [];
}

/** Everything, in the order a reviewer cares about. */
export function scan(html: string): Finding[] {
  return [
    ...scanFor(html, SECRETS),
    ...scanFor(html, PII),
    ...cardNumbers(html),
    ...scanFor(html, NETWORK),
    ...checkPolicy(html),
  ];
}
