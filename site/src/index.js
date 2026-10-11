/**
 * RETRO-DECK MD-1 — site retrodeck.lastparadox.dev (Cloudflare Worker + assets statiques + D1).
 *
 * Les pages sont servies par les assets statiques (dossier public/). Ce Worker ne répond qu'à /api/*.
 *
 *   POST /api/waitlist   { email, lang?, source?, website? (honeypot) }
 *   GET  /api/health     { ok: true }
 *   /api/pay/*, /api/stripe-webhook   → transmis au Worker de paiement privé (liaison PAY), s'il existe
 *
 * Données conservées : email, langue, source, date. Jamais l'adresse IP : le rate-limit
 * utilise un hash éphémère stocké 60 s dans KV. Un email déjà inscrit reçoit la même
 * réponse qu'un nouveau, pour ne pas révéler qui est inscrit.
 */

const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: HEADERS });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function hashIp(ip) {
  const data = new TextEncoder().encode(`retrodeck-waitlist:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/health' && request.method === 'GET') return json({ ok: true });

    // Paiement : le code vit dans un Worker PRIVÉ (liaison de service « PAY »). Sans liaison, rien n'est vendable.
    if (pathname.startsWith('/api/pay/') || pathname === '/api/stripe-webhook') {
      if (!env.PAY) return json({ error: 'payments_unavailable' }, 503);
      return env.PAY.fetch(request);
    }

    if (pathname === '/api/waitlist') {
      if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: 'bad_request' }, 400);
      }

      // Honeypot : un bot remplit ce champ invisible → réponse « ok » sans rien enregistrer.
      if (body.website) return json({ ok: true });

      const email = String(body.email || '').trim().toLowerCase();
      if (email.length > 254 || !EMAIL_RE.test(email)) return json({ error: 'invalid_email' }, 400);
      const lang = body.lang === 'en' ? 'en' : 'fr';
      const source = String(body.source || '').slice(0, 40);

      // Anti-spam : une inscription par minute et par visiteur (hash d'IP éphémère, jamais conservé).
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const key = 'rl:' + (await hashIp(ip));
      if (await env.RL.get(key)) return json({ error: 'too_many_requests' }, 429);
      await env.RL.put(key, '1', { expirationTtl: 60 });

      try {
        await env.DB.prepare('INSERT OR IGNORE INTO waitlist (email, lang, source) VALUES (?, ?, ?)')
          .bind(email, lang, source)
          .run();
      } catch {
        return json({ error: 'server_error' }, 500);
      }
      return json({ ok: true });
    }

    return json({ error: 'not_found' }, 404);
  },
};
