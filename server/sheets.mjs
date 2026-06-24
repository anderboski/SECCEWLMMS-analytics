import { readFileSync } from 'node:fs';
import { createSign } from 'node:crypto';

const b64url = (buf) =>
  Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

// Creates a minimal, zero-dependency Google Sheets read client backed by a
// service account. The private key never leaves this Node process.
export function createSheets({ saFile }) {
  const sa = JSON.parse(readFileSync(saFile, 'utf8'));
  let cache = { token: null, exp: 0 };

  function makeJwt() {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const claim = {
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      aud: sa.token_uri,
      iat: now,
      exp: now + 3600,
    };
    const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`;
    const sig = createSign('RSA-SHA256').update(unsigned).sign(sa.private_key);
    return `${unsigned}.${b64url(sig)}`;
  }

  async function getToken() {
    const now = Math.floor(Date.now() / 1000);
    if (cache.token && cache.exp - 60 > now) return cache.token;
    const res = await fetch(sa.token_uri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: makeJwt(),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Token error ${res.status}: ${JSON.stringify(data)}`);
    cache = { token: data.access_token, exp: now + (data.expires_in || 3600) };
    return cache.token;
  }

  async function getValues(spreadsheetId, range) {
    const token = await getToken();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) throw new Error(`Sheets error ${res.status}: ${JSON.stringify(data)}`);
    return data.values || [];
  }

  return { getValues };
}

export function extractSheetId(url) {
  const m = /\/d\/([a-zA-Z0-9-_]+)/.exec(url || '');
  return m ? m[1] : null;
}
