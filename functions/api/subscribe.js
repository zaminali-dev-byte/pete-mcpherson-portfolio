/**
 * Same-origin newsletter subscribe endpoint for Cloudflare Pages.
 * Avoids cross-origin fetch to *.workers.dev (CORS + ad-blocker issues).
 * Uses the same KV namespace as workers/newsletter.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.NEWSLETTER_SUBSCRIBERS) {
    return json(
      {
        ok: false,
        error:
          'Newsletter storage is not configured (missing NEWSLETTER_SUBSCRIBERS binding).',
      },
      500,
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400);
  }

  const emailRaw = body?.email;
  const listIdRaw = body?.listId;

  if (typeof emailRaw !== 'string' || !emailRaw.trim()) {
    return json({ ok: false, error: 'email is required' }, 400);
  }

  if (typeof listIdRaw !== 'string' || !listIdRaw.trim()) {
    return json({ ok: false, error: 'listId is required' }, 400);
  }

  const email = emailRaw.trim().toLowerCase();
  const listId = listIdRaw.trim();

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: false, error: 'Invalid email format' }, 400);
  }

  if (listId.length > 64) {
    return json({ ok: false, error: 'listId is too long' }, 400);
  }

  const key = `list:${listId}:email:${email}`;
  const existing = await env.NEWSLETTER_SUBSCRIBERS.get(key);

  if (existing) {
    return json({ ok: true, message: 'Already subscribed', email, listId }, 200);
  }

  await env.NEWSLETTER_SUBSCRIBERS.put(
    key,
    JSON.stringify({
      email,
      listId,
      subscribedAt: new Date().toISOString(),
    }),
  );

  return json({ ok: true, message: 'Subscribed', email, listId }, 201);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
