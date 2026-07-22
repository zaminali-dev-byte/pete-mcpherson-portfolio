/**
 * Pete McPherson newsletter subscribe Worker.
 * Stores emails in Cloudflare KV — no third-party ESP required.
 */

const ALLOWED_ORIGINS = new Set([
  'https://pete-mcpherson-portfolio-1lr.pages.dev',
  'http://localhost:4321',
  'http://127.0.0.1:4321',
  'http://localhost:8787',
  'http://127.0.0.1:8787',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function corsHeaders(origin) {
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : [...ALLOWED_ORIGINS][0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(origin),
    },
  });
}

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function normalizeListId(listId) {
  return String(listId).trim();
}

async function handleSubscribe(request, env, origin) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400, origin);
  }

  const emailRaw = body?.email;
  const listIdRaw = body?.listId;

  if (typeof emailRaw !== 'string' || !emailRaw.trim()) {
    return json({ ok: false, error: 'email is required' }, 400, origin);
  }

  if (typeof listIdRaw !== 'string' || !listIdRaw.trim()) {
    return json({ ok: false, error: 'listId is required' }, 400, origin);
  }

  const email = normalizeEmail(emailRaw);
  const listId = normalizeListId(listIdRaw);

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: false, error: 'Invalid email format' }, 400, origin);
  }

  if (listId.length > 64) {
    return json({ ok: false, error: 'listId is too long' }, 400, origin);
  }

  const key = `list:${listId}:email:${email}`;
  const existing = await env.NEWSLETTER_SUBSCRIBERS.get(key);

  if (existing) {
    return json(
      { ok: true, message: 'Already subscribed', email, listId },
      200,
      origin,
    );
  }

  const record = {
    email,
    listId,
    subscribedAt: new Date().toISOString(),
  };

  await env.NEWSLETTER_SUBSCRIBERS.put(key, JSON.stringify(record));

  return json(
    { ok: true, message: 'Subscribed', email, listId },
    201,
    origin,
  );
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    if (request.method === 'GET' && (path === '/health' || path === '/')) {
      return json({ ok: true, service: 'pete-newsletter' }, 200, origin);
    }

    if (request.method === 'POST' && (path === '/subscribe' || path === '/')) {
      return handleSubscribe(request, env, origin);
    }

    return json({ ok: false, error: 'Not found' }, 404, origin);
  },
};
