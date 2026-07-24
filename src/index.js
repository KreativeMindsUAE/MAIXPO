const ALLOWED_ORIGINS = [
  'https://maixpo.com',
  'https://www.maixpo.com',
  'https://maixpo.pages.dev',
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function json(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

const VALID_TIERS = ['standard', 'vip'];
const STRIPE_PRICES = { standard: 3999, vip: 9999 }; // cents USD
const STRIPE_NAMES = {
  standard: 'MAIXPO 2026 — Standard Ticket (Early Bird)',
  vip: 'MAIXPO 2026 — VIP Executive Ticket (Early Bird)',
};
const TIER_LABELS = { standard: 'Standard Early Bird', vip: 'VIP Executive' };
const VALID_CITIES = ['KL', 'Dubai'];
const VALID_INDUSTRIES = ['agency', 'brand', 'saas', 'consulting', 'media', 'other'];
const VALID_AI_STAGES = ['not_yet', 'exploring', 'using'];
const VALID_GOALS = ['learn', 'network', 'hire', 'vendors', 'invest'];
const VALID_HEAR = ['social', 'colleague', 'google', 'email', 'other'];

// ── STRIPE ────────────────────────────────────────────────────────────────────

async function stripeCreateCheckout(env, { email, name, tier, city, registrationId, amountOverride }) {
  const amount = amountOverride ?? STRIPE_PRICES[tier];
  if (!amount) throw new Error('Invalid tier for Stripe');
  const productName = STRIPE_NAMES[tier] + ' — ' + city;
  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('line_items[0][price_data][currency]', 'usd');
  params.set('line_items[0][price_data][product_data][name]', productName);
  params.set('line_items[0][price_data][unit_amount]', String(amount));
  params.set('line_items[0][quantity]', '1');
  params.set('success_url', 'https://maixpo.com/payment-success?session_id={CHECKOUT_SESSION_ID}');
  params.set('cancel_url', 'https://maixpo.com/payment-cancelled');
  params.set('customer_email', email);
  params.set('metadata[registration_id]', String(registrationId));
  params.set('metadata[ticket_tier]', tier);
  params.set('metadata[city]', city);
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(env.STRIPE_SECRET_KEY + ':'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('Stripe: ' + err);
  }
  return res.json();
}

// ── GMAIL HELPERS ─────────────────────────────────────────────────────────────

const _gmailTokenCache = new Map();

function _b64urlEncode(bytes) {
  const b64 = btoa(String.fromCharCode(...bytes));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function _pemToDer(pem) {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '');
  const bin = atob(body);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

async function _gmailGetAccessToken(env, impersonate) {
  const now = Math.floor(Date.now() / 1000);
  const raw = env.GMAIL_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GMAIL_SERVICE_ACCOUNT_JSON secret not set');
  const sa = JSON.parse(raw);
  const email = (impersonate || env.GMAIL_IMPERSONATE_EMAIL || sa.client_email).trim();
  const cached = _gmailTokenCache.get(email);
  if (cached && cached.expiresAt - 60 > now) return cached.token;

  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email,
    sub: email,
    scope: 'https://www.googleapis.com/auth/gmail.send',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const enc = new TextEncoder();
  const headerB64 = _b64urlEncode(enc.encode(JSON.stringify(header)));
  const payloadB64 = _b64urlEncode(enc.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    _pemToDer(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc.encode(signingInput));
  const jwt = `${signingInput}.${_b64urlEncode(new Uint8Array(sig))}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gmail token exchange failed: ${res.status} ${errText}`);
  }
  const data = await res.json();
  _gmailTokenCache.set(email, { token: data.access_token, expiresAt: now + (data.expires_in || 3600) });
  return data.access_token;
}

function _b64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function _buildRfc822(from, fromName, to, subject, html, attachments) {
  const outer = 'mxo_o_' + Math.random().toString(36).slice(2);
  const inner = 'mxo_i_' + Math.random().toString(36).slice(2);
  const encSubject = '=?UTF-8?B?' + _b64(subject) + '?=';
  const plainText = 'Your MAIXPO 2026 ticket is confirmed. Please open in an HTML email client to view your ticket card.';

  const lines = [
    `From: "${fromName}" <${from}>`,
    `To: ${to}`,
    `Subject: ${encSubject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${outer}"`,
    '',
    `--${outer}`,
    `Content-Type: multipart/alternative; boundary="${inner}"`,
    '',
    `--${inner}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    _b64(plainText),
    '',
    `--${inner}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    _b64(html),
    '',
    `--${inner}--`,
    '',
  ];

  for (const att of (attachments || [])) {
    lines.push(`--${outer}`);
    lines.push(`Content-Type: ${att.mime}; name="${att.filename}"`);
    lines.push('Content-Transfer-Encoding: base64');
    lines.push(`Content-Disposition: attachment; filename="${att.filename}"`);
    lines.push('');
    lines.push(att.data);
    lines.push('');
  }

  lines.push(`--${outer}--`);
  lines.push('');
  return lines.join('\r\n');
}

async function sendGmailEmail(env, { to, subject, html, attachments }) {
  const from = (env.GMAIL_IMPERSONATE_EMAIL || 'noreply@maixpo.com').trim();
  const token = await _gmailGetAccessToken(env, from);
  const raw = _buildRfc822(from, 'MAIXPO 2026', to, subject, html, attachments);
  const rawB64 = _b64urlEncode(new TextEncoder().encode(raw));
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: rawB64 }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gmail send failed: ${res.status} ${errText.slice(0, 400)}`);
  }
  return res.json();
}

// ── TICKET HELPERS ────────────────────────────────────────────────────────────

function generateTicketSvg({ full_name, ticket_tier, city, ticket_id }) {
  const tierLabel = (TIER_LABELS[ticket_tier] || ticket_tier).toUpperCase();
  const parts = full_name.trim().toUpperCase().split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  const cityLabel = city === 'KL' ? 'KUALA LUMPUR, MY' : 'DUBAI, UAE';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="380" height="560" viewBox="0 0 380 560" xmlns="http://www.w3.org/2000/svg">
  <rect width="380" height="560" fill="#0a0a0a"/>
  <rect x="0" y="0" width="380" height="92" fill="#e8ff00"/>
  <text x="24" y="54" font-family="Arial Black,Arial,sans-serif" font-size="28" font-weight="900" letter-spacing="5" fill="#0a0a0a">MAIXPO</text>
  <text x="24" y="76" font-family="Arial,sans-serif" font-size="9" font-weight="700" letter-spacing="2" fill="rgba(10,10,10,0.5)">2026 EDITION</text>
  <rect x="250" y="32" width="106" height="24" fill="rgba(10,10,10,0.12)"/>
  <text x="303" y="48" font-family="Arial,sans-serif" font-size="8" font-weight="700" letter-spacing="1.5" fill="#0a0a0a" text-anchor="middle">${tierLabel}</text>
  <text x="24" y="168" font-family="Arial Black,Arial,sans-serif" font-size="52" font-weight="900" letter-spacing="3" fill="#f5f2ec">${firstName}</text>
  <text x="24" y="228" font-family="Arial Black,Arial,sans-serif" font-size="52" font-weight="900" letter-spacing="3" fill="#e8ff00">${lastName || ' '}</text>
  <line x1="24" y1="252" x2="356" y2="252" stroke="rgba(245,242,236,0.1)" stroke-width="1"/>
  <text x="24" y="280" font-family="Arial,sans-serif" font-size="7" font-weight="700" letter-spacing="2" fill="rgba(245,242,236,0.4)">LOCATION</text>
  <text x="24" y="296" font-family="Arial,sans-serif" font-size="10" font-weight="700" letter-spacing="1" fill="#f5f2ec">${cityLabel}</text>
  <line x1="150" y1="264" x2="150" y2="308" stroke="rgba(245,242,236,0.07)" stroke-width="1"/>
  <text x="162" y="280" font-family="Arial,sans-serif" font-size="7" font-weight="700" letter-spacing="2" fill="rgba(245,242,236,0.4)">DATE</text>
  <text x="162" y="296" font-family="Arial,sans-serif" font-size="10" font-weight="700" letter-spacing="1" fill="#f5f2ec">SEPT 2026</text>
  <line x1="270" y1="264" x2="270" y2="308" stroke="rgba(245,242,236,0.07)" stroke-width="1"/>
  <text x="282" y="280" font-family="Arial,sans-serif" font-size="7" font-weight="700" letter-spacing="2" fill="rgba(245,242,236,0.4)">ADMIT</text>
  <text x="282" y="296" font-family="Arial,sans-serif" font-size="10" font-weight="700" letter-spacing="1" fill="#f5f2ec">1 PERSON</text>
  <line x1="24" y1="316" x2="356" y2="316" stroke="rgba(245,242,236,0.07)" stroke-width="1"/>
  <rect x="24" y="340" width="332" height="72" fill="rgba(232,255,0,0.04)" rx="2"/>
  <text x="190" y="368" font-family="Arial,sans-serif" font-size="8" font-weight="700" letter-spacing="2" fill="rgba(245,242,236,0.4)" text-anchor="middle">TICKET ID</text>
  <text x="190" y="392" font-family="Arial Black,Courier New,monospace" font-size="14" font-weight="900" letter-spacing="2" fill="#f5f2ec" text-anchor="middle">${ticket_id}</text>
  <text x="190" y="412" font-family="Arial,sans-serif" font-size="8" letter-spacing="1" fill="rgba(245,242,236,0.3)" text-anchor="middle">Present this ID at venue entrance</text>
  <rect x="0" y="460" width="380" height="100" fill="#111111"/>
  <line x1="0" y1="460" x2="380" y2="460" stroke="rgba(245,242,236,0.07)" stroke-width="1"/>
  <text x="190" y="500" font-family="Arial,sans-serif" font-size="9" letter-spacing="3" fill="rgba(245,242,236,0.5)" text-anchor="middle">MAIXPO.COM</text>
  <text x="190" y="520" font-family="Arial,sans-serif" font-size="8" fill="rgba(245,242,236,0.2)" text-anchor="middle">hello@maixpo.com</text>
</svg>`;
}

function generateTicketId(city) {
  const chars = '0123456789ABCDEF';
  let hex = '';
  for (let i = 0; i < 8; i++) hex += chars[Math.floor(Math.random() * 16)];
  return `MAIXPO-${city}-26${hex}`;
}

function ticketEmailHtml({ full_name, ticket_tier, city, ticket_id }) {
  const tierLabel = TIER_LABELS[ticket_tier] || ticket_tier;
  const nameParts = full_name.trim().split(/\s+/);
  const firstName = nameParts[0] || full_name;
  const lastName = nameParts.slice(1).join(' ') || '';
  const cityFull = city === 'KL' ? 'Kuala Lumpur, Malaysia' : 'Dubai, UAE';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your MAIXPO 2026 Ticket</title>
</head>
<body style="margin:0;padding:0;background:#0e0e0e;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0e0e0e;">
<tr><td align="center" style="padding:48px 16px 0;">

  <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

    <!-- Logo -->
    <tr>
      <td style="padding-bottom:36px;">
        <span style="font-size:26px;font-weight:900;letter-spacing:6px;color:#f5f2ec;text-transform:uppercase;">MAI<span style="color:#e8ff00;">XPO</span></span>
      </td>
    </tr>

    <!-- Greeting -->
    <tr>
      <td style="padding-bottom:24px;border-bottom:1px solid rgba(245,242,236,0.07);">
        <p style="font-size:22px;font-weight:700;color:#f5f2ec;margin:0 0 10px;line-height:1.3;">Hello, ${firstName}.</p>
        <p style="font-size:15px;color:rgba(245,242,236,0.6);margin:0;line-height:1.7;">Thank you for registering for <strong style="color:#f5f2ec;">MAIXPO 2026</strong>. Your payment is confirmed and your spot is reserved. We look forward to seeing you there.</p>
      </td>
    </tr>

    <!-- Ticket ID callout -->
    <tr>
      <td style="padding:28px 0 28px;border-bottom:1px solid rgba(245,242,236,0.07);">
        <div style="font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(245,242,236,0.4);margin-bottom:10px;">Your Ticket ID</div>
        <div style="font-size:22px;font-weight:900;letter-spacing:3px;color:#e8ff00;font-family:'Courier New',Courier,monospace;">${ticket_id}</div>
        <div style="font-size:12px;color:rgba(245,242,236,0.35);margin-top:6px;">Present this ID at the venue entrance. Save this email as your entry record.</div>
      </td>
    </tr>

    <!-- Spacer -->
    <tr><td style="height:32px;"></td></tr>

    <!-- Ticket card label -->
    <tr>
      <td style="padding-bottom:14px;">
        <span style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(245,242,236,0.35);">Your Conference Pass</span>
      </td>
    </tr>

    <!-- Ticket card -->
    <tr>
      <td>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid rgba(245,242,236,0.08);max-width:380px;">

          <!-- Yellow header band -->
          <tr>
            <td style="background:#e8ff00;padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size:22px;font-weight:900;letter-spacing:4px;color:#0a0a0a;text-transform:uppercase;line-height:1;">MAI<span style="opacity:0.35;">XPO</span></div>
                    <div style="font-size:8px;font-weight:600;letter-spacing:2px;color:rgba(10,10,10,0.45);text-transform:uppercase;margin-top:4px;">2026 Edition</div>
                  </td>
                  <td align="right">
                    <span style="font-size:8px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0a0a0a;background:rgba(10,10,10,0.14);padding:5px 10px;">${tierLabel}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Name -->
          <tr>
            <td style="padding:24px 24px 20px;border-bottom:1px solid rgba(245,242,236,0.07);">
              <div style="font-size:52px;font-weight:900;letter-spacing:4px;text-transform:uppercase;color:#f5f2ec;line-height:0.9;">${firstName}</div>
              ${lastName ? `<div style="font-size:52px;font-weight:900;letter-spacing:4px;text-transform:uppercase;color:#e8ff00;line-height:0.9;">${lastName}</div>` : ''}
            </td>
          </tr>

          <!-- Perforation -->
          <tr>
            <td style="height:2px;background:repeating-linear-gradient(to right,transparent 0 6px,rgba(245,242,236,0.1) 6px 12px);"></td>
          </tr>

          <!-- Meta -->
          <tr>
            <td style="padding:16px 24px 18px;border-bottom:1px solid rgba(245,242,236,0.07);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" style="padding-right:10px;">
                    <div style="font-size:7px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(245,242,236,0.38);margin-bottom:5px;">Location</div>
                    <div style="font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#f5f2ec;">${cityFull}</div>
                  </td>
                  <td width="33%" style="border-left:1px solid rgba(245,242,236,0.07);padding:0 10px;">
                    <div style="font-size:7px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(245,242,236,0.38);margin-bottom:5px;">Date</div>
                    <div style="font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#f5f2ec;">Sep 2026</div>
                  </td>
                  <td width="33%" style="border-left:1px solid rgba(245,242,236,0.07);padding-left:10px;">
                    <div style="font-size:7px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(245,242,236,0.38);margin-bottom:5px;">Admission</div>
                    <div style="font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#f5f2ec;">1 Person</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Ticket ID on card -->
          <tr>
            <td align="center" style="padding:20px 24px 22px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:3px;font-family:'Courier New',monospace;color:#f5f2ec;">${ticket_id}</div>
              <div style="font-size:9px;color:rgba(245,242,236,0.25);margin-top:5px;letter-spacing:1px;">Unique Entry Pass</div>
            </td>
          </tr>

          <!-- Card footer -->
          <tr>
            <td align="center" style="background:#141414;border-top:1px solid rgba(245,242,236,0.07);padding:10px 24px;">
              <span style="font-size:8px;letter-spacing:2px;text-transform:uppercase;color:rgba(245,242,236,0.50);">maixpo.com</span>
            </td>
          </tr>

        </table>
      </td>
    </tr>

    <!-- What to expect -->
    <tr>
      <td style="padding:40px 0 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid rgba(245,242,236,0.07);">
          <tr>
            <td style="padding:24px 28px;">
              <div style="font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(245,242,236,0.4);margin-bottom:14px;">What's Next</div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:10px;">
                    <span style="color:#e8ff00;font-weight:700;margin-right:8px;">1.</span>
                    <span style="font-size:13px;color:rgba(245,242,236,0.65);">Save this email - it's your entry record</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:10px;">
                    <span style="color:#e8ff00;font-weight:700;margin-right:8px;">2.</span>
                    <span style="font-size:13px;color:rgba(245,242,236,0.65);">Your attached ticket SVG can be printed or shown on-screen</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span style="color:#e8ff00;font-weight:700;margin-right:8px;">3.</span>
                    <span style="font-size:13px;color:rgba(245,242,236,0.65);">Present Ticket ID <strong style="color:#f5f2ec;font-family:'Courier New',monospace;">${ticket_id}</strong> at the door</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td align="center" style="padding:40px 0 48px;">
        <p style="font-size:13px;color:rgba(245,242,236,0.35);margin:0 0 8px;">Questions? We're here.</p>
        <a href="mailto:hello@maixpo.com" style="color:#e8ff00;font-size:13px;text-decoration:none;font-weight:600;">hello@maixpo.com</a>
        <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(245,242,236,0.2);margin:24px 0 0;">MAIXPO 2026 &middot; maixpo.com</p>
      </td>
    </tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
}

// ── ADMIN AUTH ────────────────────────────────────────────────────────────────

async function adminSignToken(email, secret) {
  const exp = Math.floor(Date.now() / 1000) + 172800; // 48h
  const enc = new TextEncoder();
  const payload = _b64urlEncode(enc.encode(JSON.stringify({ email, exp })));
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return payload + '.' + _b64urlEncode(new Uint8Array(sig));
}

async function adminVerifyToken(token, secret) {
  try {
    const dot = token.lastIndexOf('.');
    if (dot < 0) return null;
    const payload = token.slice(0, dot);
    const sigPart = token.slice(dot + 1).replace(/-/g, '+').replace(/_/g, '/');
    const sigPad = sigPart + '='.repeat((4 - sigPart.length % 4) % 4);
    const sigBytes = Uint8Array.from(atob(sigPad), c => c.charCodeAt(0));
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(payload));
    if (!valid) return null;
    const payPart = payload.replace(/-/g, '+').replace(/_/g, '/');
    const payPad = payPart + '='.repeat((4 - payPart.length % 4) % 4);
    const data = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payPad), c => c.charCodeAt(0))));
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch { return null; }
}

async function checkAdminAuth(request, env) {
  if (!env.ADMIN_SECRET) return null;
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  return adminVerifyToken(auth.slice(7), env.ADMIN_SECRET);
}

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // ── Payment verification + ticket email ────────────────────────────────
    if (request.method === 'GET' && url.pathname === '/api/payment-verify') {
      const sessionId = url.searchParams.get('session_id');
      if (!sessionId) return json({ error: 'Missing session_id' }, 400, origin);

      const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
        headers: { 'Authorization': 'Basic ' + btoa(env.STRIPE_SECRET_KEY + ':') },
      });
      if (!res.ok) return json({ error: 'Session not found' }, 404, origin);
      const session = await res.json();
      const paid = session.payment_status === 'paid';

      if (paid) {
        // Fetch current row to check ticket_emailed
        const row = await env.DB.prepare(
          `SELECT id, full_name, email, ticket_tier, city, ticket_id, ticket_emailed FROM registrations WHERE stripe_session_id=?`
        ).bind(sessionId).first();

        if (row && !row.ticket_emailed) {
          // Generate unique ticket ID if not already set
          const ticketId = row.ticket_id || generateTicketId(row.city || 'KL');

          // Update D1: payment_status, ticket_id, ticket_emailed
          await env.DB.prepare(
            `UPDATE registrations SET payment_status='paid', ticket_id=?, ticket_emailed=1 WHERE id=?`
          ).bind(ticketId, row.id).run();

          // Send ticket email (non-blocking fail)
          const emailParams = { full_name: row.full_name, ticket_tier: row.ticket_tier, city: row.city || 'KL', ticket_id: ticketId };
          const html = ticketEmailHtml(emailParams);
          const svgStr = generateTicketSvg(emailParams);
          const svgB64 = btoa(unescape(encodeURIComponent(svgStr)));
          try {
            await sendGmailEmail(env, {
              to: row.email,
              subject: `Your MAIXPO 2026 Ticket - ${row.full_name}`,
              html,
              attachments: [{ mime: 'image/svg+xml', filename: `MAIXPO-Ticket-${ticketId}.svg`, data: svgB64 }],
            });
          } catch (emailErr) {
            console.error('[ticket-email] send failed:', emailErr.message);
          }
        } else if (row && row.ticket_emailed === 0) {
          // Row exists but ticket not emailed (payment_status might be stale)
          await env.DB.prepare(`UPDATE registrations SET payment_status='paid' WHERE stripe_session_id=?`)
            .bind(sessionId).run();
        } else if (!row) {
          // Fallback: no matching row, just mark paid by session
          await env.DB.prepare(`UPDATE registrations SET payment_status='paid' WHERE stripe_session_id=?`)
            .bind(sessionId).run();
        }
      }

      return json({ paid, amount_total: session.amount_total, currency: session.currency }, 200, origin);
    }

    // ── Test ticket email (protected by INTERNAL_SECRET) ──────────────────
    if (request.method === 'POST' && url.pathname === '/api/test-ticket-email') {
      const secret = request.headers.get('x-internal-secret');
      if (!env.INTERNAL_SECRET || secret !== env.INTERNAL_SECRET) {
        return json({ error: 'Unauthorized' }, 401, origin);
      }
      let body;
      try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400, origin); }

      const { to, name, tier, city } = body;
      if (!to || !name) return json({ error: 'to and name required' }, 400, origin);

      const ticketId = generateTicketId(city || 'KL');
      const emailParams = { full_name: name, ticket_tier: tier || 'standard', city: city || 'KL', ticket_id: ticketId };
      const html = ticketEmailHtml(emailParams);
      const svgStr = generateTicketSvg(emailParams);
      const svgB64 = btoa(unescape(encodeURIComponent(svgStr)));
      try {
        const result = await sendGmailEmail(env, {
          to,
          subject: `Your MAIXPO 2026 Ticket - ${name}`,
          html,
          attachments: [{ mime: 'image/svg+xml', filename: `MAIXPO-Ticket-${ticketId}.svg`, data: svgB64 }],
        });
        return json({ sent: true, ticket_id: ticketId, gmail_id: result.id }, 200, origin);
      } catch (err) {
        return json({ error: err.message }, 500, origin);
      }
    }

    // ── Promo code validation ──────────────────────────────────────────────
    if (request.method === 'POST' && url.pathname === '/api/validate-promo') {
      let body;
      try { body = await request.json(); } catch { return json({ valid: false, error: 'Invalid JSON' }, 400, origin); }
      const code = (body.code || '').trim().toUpperCase();
      const tier = body.tier;
      if (!code) return json({ valid: false, error: 'No code provided' }, 400, origin);
      if (!VALID_TIERS.includes(tier)) return json({ valid: false, error: 'Invalid tier' }, 400, origin);

      const row = await env.DB.prepare(
        `SELECT code, discount_pct, max_uses, active FROM promo_codes WHERE code=?`
      ).bind(code).first();

      if (!row || !row.active) return json({ valid: false, error: 'Invalid or expired promo code' }, 200, origin);

      if (row.max_uses) {
        const usage = await env.DB.prepare(
          `SELECT COUNT(*) as cnt FROM registrations WHERE promo_code=? AND payment_status='paid'`
        ).bind(row.code).first();
        if ((usage?.cnt || 0) >= row.max_uses) {
          return json({ valid: false, error: 'This promo code has reached its usage limit' }, 200, origin);
        }
      }

      const baseAmount = STRIPE_PRICES[tier];
      const discountAmt = Math.floor(baseAmount * row.discount_pct / 100);
      const finalAmount = baseAmount - discountAmt;
      return json({
        valid: true,
        code: row.code,
        discount_pct: row.discount_pct,
        original_amount: baseAmount,
        final_amount: finalAmount,
      }, 200, origin);
    }

    // ── Registration ───────────────────────────────────────────────────────
    if (request.method === 'POST' && url.pathname === '/api/register') {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: 'Invalid JSON' }, 400, origin);
      }

      const { city, ticket_tier, full_name, email, company, job_title, industry, ai_stage, goals, hear_about, promo_code } = body;

      if (!full_name?.trim()) return json({ error: 'Full name is required' }, 400, origin);
      if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Valid email is required' }, 400, origin);
      if (!VALID_TIERS.includes(ticket_tier)) return json({ error: 'Invalid ticket tier' }, 400, origin);
      if (!VALID_CITIES.includes(city)) return json({ error: 'Invalid city' }, 400, origin);

      const safeCompany = company?.trim() || null;
      const safeJobTitle = job_title?.trim() || null;
      const safeIndustry = VALID_INDUSTRIES.includes(industry) ? industry : null;
      const safeAiStage = VALID_AI_STAGES.includes(ai_stage) ? ai_stage : null;
      const goalsArr = Array.isArray(goals) ? goals.filter(g => VALID_GOALS.includes(g)) : [];
      const safeHear = VALID_HEAR.includes(hear_about) ? hear_about : null;

      // Validate promo code if provided
      let appliedPromoCode = null;
      let promoDiscountPct = null;
      let finalAmount = STRIPE_PRICES[ticket_tier];

      if (promo_code?.trim()) {
        const promoRow = await env.DB.prepare(
          `SELECT code, discount_pct, max_uses, active FROM promo_codes WHERE code=?`
        ).bind(promo_code.trim().toUpperCase()).first();

        if (promoRow && promoRow.active) {
          let withinLimit = true;
          if (promoRow.max_uses) {
            const usage = await env.DB.prepare(
              `SELECT COUNT(*) as cnt FROM registrations WHERE promo_code=? AND payment_status='paid'`
            ).bind(promoRow.code).first();
            if ((usage?.cnt || 0) >= promoRow.max_uses) withinLimit = false;
          }
          if (withinLimit) {
            appliedPromoCode = promoRow.code;
            promoDiscountPct = promoRow.discount_pct;
            finalAmount = finalAmount - Math.floor(finalAmount * promoRow.discount_pct / 100);
          }
        }
      }

      try {
        const result = await env.DB.prepare(
          `INSERT INTO registrations (city, ticket_tier, full_name, email, company, job_title, industry, ai_stage, goals, hear_about, promo_code, promo_discount_pct)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          city,
          ticket_tier,
          full_name.trim(),
          email.trim().toLowerCase(),
          safeCompany,
          safeJobTitle,
          safeIndustry,
          safeAiStage,
          goalsArr.join(',') || null,
          safeHear,
          appliedPromoCode,
          promoDiscountPct
        ).run();

        const registrationId = result.meta.last_row_id;

        let checkout_url = null;
        try {
          const session = await stripeCreateCheckout(env, {
            email: email.trim().toLowerCase(),
            name: full_name.trim(),
            tier: ticket_tier,
            city,
            registrationId,
            amountOverride: finalAmount,
          });
          checkout_url = session.url;
          await env.DB.prepare(`UPDATE registrations SET stripe_session_id=? WHERE id=?`)
            .bind(session.id, registrationId).run();
        } catch (stripeErr) {
          return json({ error: 'Payment setup failed. Please email hello@maixpo.com with your name to complete registration.', registration_id: registrationId }, 500, origin);
        }

        return json({ success: true, id: registrationId, checkout_url }, 200, origin);
      } catch (err) {
        return json({ error: 'Registration failed, please try again' }, 500, origin);
      }
    }

    // ── Sitemap ───────────────────────────────────────────────────────────────
    if (request.method === 'GET' && url.pathname === '/sitemap.xml') {
      let postUrls = '';
      try {
        const { results } = await env.DB.prepare(
          "SELECT slug, updated_at FROM insights_posts WHERE status = 'published' ORDER BY published_at DESC"
        ).all();
        postUrls = results.map(p => {
          const date = p.updated_at
            ? new Date(p.updated_at * 1000).toISOString().split('T')[0]
            : '2026-07-24';
          return `
  <url>
    <loc>https://maixpo.com/insights/${p.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
        }).join('');
      } catch (_) {}

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://maixpo.com/</loc>
    <lastmod>2026-07-24</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://maixpo.com/insights</loc>
    <lastmod>2026-07-24</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>${postUrls}
</urlset>`;

      return new Response(xml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, must-revalidate',
          ...corsHeaders(origin),
        },
      });
    }

    // ── Admin routes ──────────────────────────────────────────────────────────
    if (url.pathname.startsWith('/api/admin/')) {

      // POST /api/admin/send-otp — no auth required
      if (request.method === 'POST' && url.pathname === '/api/admin/send-otp') {
        let body;
        try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400, origin); }
        const email = (body.email || '').trim().toLowerCase();
        if (!email) return json({ error: 'Email required' }, 400, origin);

        // Access code gate — validated server-side only, never exposed in client code
        const accessCode = (body.access_code || '').trim();
        if (!env.ADMIN_ACCESS_CODE || accessCode !== env.ADMIN_ACCESS_CODE) {
          return json({ error: 'Invalid access code' }, 403, origin);
        }

        // Email whitelist — stored in ADMIN_WHITELIST secret only, no hardcoded fallback
        const whitelist = env.ADMIN_WHITELIST
          ? env.ADMIN_WHITELIST.split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
          : [];
        if (!whitelist.length || !whitelist.includes(email)) {
          return json({ error: 'Not authorized' }, 403, origin);
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const expiresAt = Math.floor(Date.now() / 1000) + 600;
        await env.DB.prepare(`INSERT INTO admin_otps (email, otp, expires_at) VALUES (?, ?, ?)`).bind(email, otp, expiresAt).run();

        // Collect audit context from Cloudflare request
        const loginIp = request.headers.get('CF-Connecting-IP') || 'unknown';
        const loginCountry = (request.cf && request.cf.country) ? request.cf.country : 'unknown';
        const loginIsp = (request.cf && request.cf.asOrganization) ? request.cf.asOrganization : 'unknown';
        const loginCity = (request.cf && request.cf.city) ? request.cf.city : '';
        const loginTime = new Date().toUTCString();

        try {
          await sendGmailEmail(env, {
            to: email,
            subject: 'MAIXPO Admin — Your login code',
            html: `<div style="font-family:monospace;background:#0a0a0a;color:#f5f2ec;padding:32px;max-width:460px;">
              <div style="font-size:20px;font-weight:900;letter-spacing:4px;color:#e8ff00;margin-bottom:24px;">MAIXPO ADMIN</div>
              <div style="font-size:13px;color:rgba(245,242,236,0.6);margin-bottom:12px;">Your one-time login code:</div>
              <div style="font-size:36px;font-weight:900;letter-spacing:8px;color:#e8ff00;margin-bottom:12px;">${otp}</div>
              <div style="font-size:11px;color:rgba(245,242,236,0.35);margin-bottom:24px;">Expires in 10 minutes. Do not share this code.</div>
              <div style="border-top:1px solid rgba(245,242,236,0.1);padding-top:16px;font-size:10px;color:rgba(245,242,236,0.3);line-height:2;">
                <div style="color:rgba(245,242,236,0.5);font-weight:700;letter-spacing:2px;margin-bottom:6px;">ACCESS AUDIT LOG</div>
                <div>IP &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${loginIp}</div>
                <div>Network : ${loginIsp}</div>
                <div>Location: ${loginCity ? loginCity + ', ' : ''}${loginCountry}</div>
                <div>Time &nbsp;&nbsp;&nbsp;: ${loginTime}</div>
                <div style="margin-top:10px;color:rgba(245,242,236,0.18);line-height:1.6;">If you did not request this code, your admin credentials may be compromised. Do not share this code. Contact the system administrator immediately.</div>
              </div>
            </div>`,
          });
        } catch (err) {
          return json({ error: 'Failed to send email: ' + err.message }, 500, origin);
        }
        return json({ sent: true }, 200, origin);
      }

      // POST /api/admin/verify-otp — no auth required
      if (request.method === 'POST' && url.pathname === '/api/admin/verify-otp') {
        if (!env.ADMIN_SECRET) return json({ error: 'Admin not configured' }, 500, origin);
        let body;
        try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400, origin); }
        const email = (body.email || '').trim().toLowerCase();
        const otp = (body.otp || '').trim();
        if (!email || !otp) return json({ error: 'Email and OTP required' }, 400, origin);
        const now = Math.floor(Date.now() / 1000);
        const row = await env.DB.prepare(
          `SELECT id FROM admin_otps WHERE email=? AND otp=? AND used=0 AND expires_at>? ORDER BY id DESC LIMIT 1`
        ).bind(email, otp, now).first();
        if (!row) return json({ error: 'Invalid or expired code' }, 401, origin);
        await env.DB.prepare(`UPDATE admin_otps SET used=1 WHERE id=?`).bind(row.id).run();
        const token = await adminSignToken(email, env.ADMIN_SECRET);
        return json({ token }, 200, origin);
      }

      // All routes below require auth
      const adminUser = await checkAdminAuth(request, env);
      if (!adminUser) return json({ error: 'Unauthorized' }, 401, origin);

      // GET /api/admin/me
      if (request.method === 'GET' && url.pathname === '/api/admin/me') {
        return json({ email: adminUser.email }, 200, origin);
      }

      // GET /api/admin/registrations
      if (request.method === 'GET' && url.pathname === '/api/admin/registrations') {
        const search = (url.searchParams.get('search') || '').trim();
        const status = url.searchParams.get('status') || 'all';
        const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
        const limit = 50;
        const offset = (page - 1) * limit;
        let where = '1=1';
        const binds = [];
        if (status !== 'all') { where += ' AND payment_status=?'; binds.push(status); }
        if (search) { where += ' AND (full_name LIKE ? OR email LIKE ? OR company LIKE ?)'; binds.push(`%${search}%`, `%${search}%`, `%${search}%`); }
        const { results } = await env.DB.prepare(
          `SELECT id, full_name, email, company, job_title, city, ticket_tier, payment_status, promo_code, promo_discount_pct, ticket_id, created_at FROM registrations WHERE ${where} ORDER BY id DESC LIMIT ? OFFSET ?`
        ).bind(...binds, limit, offset).all();
        const countRow = await env.DB.prepare(`SELECT COUNT(*) as cnt FROM registrations WHERE ${where}`).bind(...binds).first();
        return json({ registrations: results, total: countRow?.cnt || 0, page, limit }, 200, origin);
      }

      // GET /api/admin/registrations/export.csv
      if (request.method === 'GET' && url.pathname === '/api/admin/registrations/export.csv') {
        const { results } = await env.DB.prepare(
          `SELECT id, full_name, email, company, job_title, city, ticket_tier, payment_status, promo_code, promo_discount_pct, ticket_id, industry, ai_stage, goals, hear_about, created_at FROM registrations ORDER BY id DESC`
        ).all();
        const headers = ['ID', 'Name', 'Email', 'Company', 'Job Title', 'City', 'Tier', 'Status', 'Promo Code', 'Discount%', 'Ticket ID', 'Industry', 'AI Stage', 'Goals', 'Source', 'Date'];
        const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const rows = results.map(r => [r.id, r.full_name, r.email, r.company, r.job_title, r.city, r.ticket_tier, r.payment_status, r.promo_code, r.promo_discount_pct, r.ticket_id, r.industry, r.ai_stage, r.goals, r.hear_about, r.created_at].map(escape).join(','));
        const csv = [headers.map(escape).join(','), ...rows].join('\r\n');
        return new Response(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="maixpo-registrations.csv"', ...corsHeaders(origin) } });
      }

      // POST /api/admin/registrations/:id/email
      if (request.method === 'POST' && /^\/api\/admin\/registrations\/\d+\/email$/.test(url.pathname)) {
        const regId = url.pathname.split('/')[4];
        let body;
        try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400, origin); }
        const { subject, message } = body;
        if (!subject || !message) return json({ error: 'subject and message required' }, 400, origin);
        const reg = await env.DB.prepare(`SELECT email, full_name FROM registrations WHERE id=?`).bind(regId).first();
        if (!reg) return json({ error: 'Registrant not found' }, 404, origin);
        try {
          await sendGmailEmail(env, {
            to: reg.email,
            subject,
            html: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#0e0e0e;color:#f5f2ec;padding:32px;max-width:560px;">
              <div style="font-size:20px;font-weight:900;letter-spacing:4px;margin-bottom:24px;">MAI<span style="color:#e8ff00;">XPO</span></div>
              <div style="font-size:14px;line-height:1.8;white-space:pre-wrap;">${message.replace(/</g, '&lt;')}</div>
              <div style="margin-top:32px;padding-top:16px;border-top:1px solid rgba(245,242,236,0.1);font-size:11px;color:rgba(245,242,236,0.3);">MAIXPO 2026 &middot; maixpo.com</div>
            </div>`,
          });
          return json({ sent: true }, 200, origin);
        } catch (err) {
          return json({ error: err.message }, 500, origin);
        }
      }

      // GET /api/admin/promo-codes
      if (request.method === 'GET' && url.pathname === '/api/admin/promo-codes') {
        const { results } = await env.DB.prepare(
          `SELECT p.code, p.discount_pct, p.max_uses, p.active,
            (SELECT COUNT(*) FROM registrations r WHERE r.promo_code=p.code AND r.payment_status='paid') as used_count
           FROM promo_codes p ORDER BY p.code ASC`
        ).all();
        return json({ codes: results }, 200, origin);
      }

      // POST /api/admin/promo-codes
      if (request.method === 'POST' && url.pathname === '/api/admin/promo-codes') {
        let body;
        try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400, origin); }
        const code = (body.code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        const discount_pct = parseInt(body.discount_pct, 10);
        const max_uses = body.max_uses ? parseInt(body.max_uses, 10) : null;
        if (!code || isNaN(discount_pct) || discount_pct < 1 || discount_pct > 100) return json({ error: 'Valid code and discount_pct (1-100) required' }, 400, origin);
        try {
          await env.DB.prepare(`INSERT INTO promo_codes (code, discount_pct, max_uses, active) VALUES (?, ?, ?, 1)`).bind(code, discount_pct, max_uses).run();
          return json({ created: true, code }, 201, origin);
        } catch { return json({ error: 'Code already exists' }, 409, origin); }
      }

      // PATCH /api/admin/promo-codes/:code/toggle
      if (request.method === 'PATCH' && /^\/api\/admin\/promo-codes\/[A-Z0-9]+\/toggle$/.test(url.pathname)) {
        const code = url.pathname.split('/')[4];
        const row = await env.DB.prepare(`SELECT active FROM promo_codes WHERE code=?`).bind(code).first();
        if (!row) return json({ error: 'Not found' }, 404, origin);
        await env.DB.prepare(`UPDATE promo_codes SET active=? WHERE code=?`).bind(row.active ? 0 : 1, code).run();
        return json({ code, active: !row.active }, 200, origin);
      }

      // DELETE /api/admin/promo-codes/:code
      if (request.method === 'DELETE' && /^\/api\/admin\/promo-codes\/[A-Z0-9]+$/.test(url.pathname)) {
        const code = url.pathname.split('/')[4];
        await env.DB.prepare(`DELETE FROM promo_codes WHERE code=?`).bind(code).run();
        return json({ deleted: true }, 200, origin);
      }

      // GET /api/admin/settings
      if (request.method === 'GET' && url.pathname === '/api/admin/settings') {
        const { results } = await env.DB.prepare(`SELECT key, value FROM system_settings`).all();
        const settings = {};
        for (const r of results) settings[r.key] = r.value;
        return json({ settings }, 200, origin);
      }

      // POST /api/admin/settings
      if (request.method === 'POST' && url.pathname === '/api/admin/settings') {
        let body;
        try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400, origin); }
        const allowed = ['price_standard', 'price_vip', 'early_bird_active', 'early_bird_end'];
        const stmts = [];
        for (const key of allowed) {
          if (body[key] !== undefined) {
            stmts.push(env.DB.prepare(`INSERT INTO system_settings (key, value, updated_at) VALUES (?, ?, unixepoch()) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at`).bind(key, String(body[key])));
          }
        }
        if (stmts.length) await env.DB.batch(stmts);
        return json({ updated: true }, 200, origin);
      }

      // GET /api/admin/sponsors
      if (request.method === 'GET' && url.pathname === '/api/admin/sponsors') {
        const { results } = await env.DB.prepare(
          `SELECT id, sponsor_name, tier, contact_name, email, notes, status, created_at FROM sponsor_inquiries ORDER BY id DESC`
        ).all();
        return json({ sponsors: results }, 200, origin);
      }

      // POST /api/admin/sponsors
      if (request.method === 'POST' && url.pathname === '/api/admin/sponsors') {
        let body;
        try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400, origin); }
        const { sponsor_name, tier, contact_name, email, notes } = body;
        if (!sponsor_name || !contact_name || !email) return json({ error: 'sponsor_name, contact_name, email required' }, 400, origin);
        const validTiers = ['Platinum', 'Gold', 'Silver', 'Bronze', 'Media'];
        const safeTier = validTiers.includes(tier) ? tier : 'Silver';
        const result = await env.DB.prepare(
          `INSERT INTO sponsor_inquiries (sponsor_name, tier, contact_name, email, notes) VALUES (?, ?, ?, ?, ?)`
        ).bind(sponsor_name, safeTier, contact_name, email, notes || null).run();
        return json({ created: true, id: result.meta.last_row_id }, 201, origin);
      }

      // PATCH /api/admin/sponsors/:id/status
      if (request.method === 'PATCH' && /^\/api\/admin\/sponsors\/\d+\/status$/.test(url.pathname)) {
        const id = url.pathname.split('/')[4];
        let body;
        try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400, origin); }
        const validStatuses = ['new', 'contacted', 'confirmed', 'declined'];
        if (!validStatuses.includes(body.status)) return json({ error: 'Invalid status' }, 400, origin);
        await env.DB.prepare(`UPDATE sponsor_inquiries SET status=?, updated_at=unixepoch() WHERE id=?`).bind(body.status, id).run();
        return json({ updated: true }, 200, origin);
      }

      // GET /api/admin/insights
      if (request.method === 'GET' && url.pathname === '/api/admin/insights') {
        const { results } = await env.DB.prepare(
          `SELECT id, slug, title, excerpt, author, tags, status, published_at, created_at FROM insights_posts ORDER BY id DESC`
        ).all();
        return json({ posts: results }, 200, origin);
      }

      // POST /api/admin/insights
      if (request.method === 'POST' && url.pathname === '/api/admin/insights') {
        let body;
        try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400, origin); }
        const { title, slug, author, tags, excerpt, content_html, status, published_at } = body;
        if (!title || !slug) return json({ error: 'title and slug required' }, 400, origin);
        const safeStatus = status === 'published' ? 'published' : 'draft';
        try {
          const result = await env.DB.prepare(
            `INSERT INTO insights_posts (slug, title, excerpt, content_html, author, tags, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(slug, title, excerpt || null, content_html || null, author || 'MAIXPO Team', tags || null, safeStatus, published_at || null).run();
          return json({ created: true, id: result.meta.last_row_id }, 201, origin);
        } catch { return json({ error: 'Slug already exists' }, 409, origin); }
      }

      // PATCH /api/admin/insights/:id
      if (request.method === 'PATCH' && /^\/api\/admin\/insights\/\d+$/.test(url.pathname)) {
        const id = url.pathname.split('/')[4];
        let body;
        try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400, origin); }
        const safeStatus = body.status === 'published' ? 'published' : 'draft';
        const publishedAt = body.published_at ?? null;
        await env.DB.prepare(
          `UPDATE insights_posts SET status=?, published_at=?, updated_at=unixepoch() WHERE id=?`
        ).bind(safeStatus, publishedAt, id).run();
        return json({ updated: true }, 200, origin);
      }

      return json({ error: 'Admin route not found' }, 404, origin);
    }

    return json({ error: 'Not found' }, 404, origin);
  },
};
