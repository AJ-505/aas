/**
 * TOTP helpers for 2FA — authenticator apps only.
 *
 * Security notes (documented limits):
 * - Secrets are stored plaintext in the `users.totpSecret` field. Convex encrypts
 *   data at rest, but there is no additional envelope/per-field encryption in
 *   this app (scope cut, see PRD/Roadmap). Anyone with DB read access can see
 *   secrets. Backup codes likewise stored plaintext (single-use, consumed on use).
 * - Never log secrets, codes, or backup codes. Audit entries record only
 *   `userId + action` (e.g. "2fa.enabled") with no secret material.
 * - HMAC uses SHA-1 per RFC 6238 (required by authenticator apps). Window ±1
 *   tolerates ~60s clock skew.
 *
 * Implementation is dependency-free: base32 + HMAC-SHA1 are inlined so QR
 * rendering is the only external dep (client-side `qrcode`).
 */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

// ---- base32 ----
export function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i]!;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]!;
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31]!;
  }
  return output;
}

export function base32Decode(str: string): Uint8Array {
  const cleaned = str.trim().replace(/=+$/, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of cleaned) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) throw new Error("Invalid base32 character");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(bytes);
}

// ---- secret / backup codes ----
export function generateSecret(): string {
  const bytes = new Uint8Array(20); // 160-bit per RFC 4226
  crypto.getRandomValues(bytes);
  return base32Encode(bytes);
}

export function generateBackupCodes(count = 10): string[] {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // avoid I,L,O,0,1
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    let code = "";
    for (let j = 0; j < 8; j++) {
      code += alphabet[bytes[j]! % alphabet.length]!;
    }
    // format XXXX-XXXX for readability but store without dash
    codes.push(code);
  }
  return codes;
}

export function buildOtpauthUri(secret: string, email: string, issuer = "Cedric Masters Autos"): string {
  const label = `${issuer}:${email}`;
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  });
  return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
}

// ---- HMAC-SHA1 (pure JS, sync) ----
function rotl(n: number, b: number): number {
  return (n << b) | (n >>> (32 - b));
}

function sha1(bytes: Uint8Array): Uint8Array {
  // Minimal SHA-1 (RFC 3174) — small, no dep, sync
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  const ml = bytes.length * 8;
  const withOne = bytes.length + 1;
  let padLen = withOne % 64;
  padLen = padLen <= 56 ? 56 - padLen : 64 + 56 - padLen;
  const padded = new Uint8Array(withOne + padLen + 8);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Math.floor(ml / 0x100000000), false);
  view.setUint32(padded.length - 4, ml >>> 0, false);

  const w = new Uint32Array(80);
  for (let i = 0; i < padded.length; i += 64) {
    for (let j = 0; j < 16; j++) w[j] = view.getUint32(i + j * 4, false);
    for (let j = 16; j < 80; j++) w[j] = rotl(w[j - 3]! ^ w[j - 8]! ^ w[j - 14]! ^ w[j - 16]!, 1);
    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let j = 0; j < 80; j++) {
      let f: number, k: number;
      if (j < 20) { f = (b & c) | (~b & d); k = 0x5a827999; }
      else if (j < 40) { f = b ^ c ^ d; k = 0x6ed9eba1; }
      else if (j < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc; }
      else { f = b ^ c ^ d; k = 0xca62c1d6; }
      const temp = (rotl(a, 5) + f + e + k + w[j]!) >>> 0;
      e = d; d = c; c = rotl(b, 30); b = a; a = temp;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0;
  }
  const out = new Uint8Array(20);
  const oView = new DataView(out.buffer);
  oView.setUint32(0, h0, false); oView.setUint32(4, h1, false); oView.setUint32(8, h2, false); oView.setUint32(12, h3, false); oView.setUint32(16, h4, false);
  return out;
}

function hmacSha1(key: Uint8Array, msg: Uint8Array): Uint8Array {
  const blockSize = 64;
  let k = key;
  if (k.length > blockSize) k = sha1(k);
  const padded = new Uint8Array(blockSize);
  padded.set(k);
  const oKey = new Uint8Array(blockSize);
  const iKey = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) { oKey[i] = padded[i]! ^ 0x5c; iKey[i] = padded[i]! ^ 0x36; }
  const inner = new Uint8Array(iKey.length + msg.length);
  inner.set(iKey); inner.set(msg, iKey.length);
  const innerHash = sha1(inner);
  const outer = new Uint8Array(oKey.length + innerHash.length);
  outer.set(oKey); outer.set(innerHash, oKey.length);
  return sha1(outer);
}

function hotp(secretBase32: string, counter: number): string {
  const key = base32Decode(secretBase32);
  const msg = new Uint8Array(8);
  const view = new DataView(msg.buffer);
  // 64-bit big-endian counter
  view.setUint32(0, Math.floor(counter / 0x100000000), false);
  view.setUint32(4, counter >>> 0, false);
  const hs = hmacSha1(key, msg);
  const offset = hs[19]! & 0x0f;
  const bin =
    ((hs[offset]! & 0x7f) << 24) |
    (hs[offset + 1]! << 16) |
    (hs[offset + 2]! << 8) |
    hs[offset + 3]!;
  const otp = bin % 1_000_000;
  return otp.toString().padStart(6, "0");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function totpVerify(secret: string, code: string, opts?: { window?: number; nowMs?: number }): boolean {
  const sanitized = code.trim().replace(/\s|-/g, "");
  if (!/^\d{6}$/.test(sanitized)) return false;
  const window = opts?.window ?? 1;
  const now = opts?.nowMs ?? Date.now();
  const step = 30_000;
  const counter = Math.floor(now / step);
  for (let w = -window; w <= window; w++) {
    const expected = hotp(secret, counter + w);
    if (constantTimeEqual(expected, sanitized)) return true;
  }
  return false;
}

export function isValidTotpCode(code: string): boolean {
  return /^\d{6}$/.test(code.trim());
}
