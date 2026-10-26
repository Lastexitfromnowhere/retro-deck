/**
 * Pack de fiches offert contre un email (retrodeck.lastparadox.dev).
 *
 *   GET  /api/pack/config          { emails: true|false }   (la fonction n'est active que si l'envoi d'emails l'est)
 *   POST /api/pack/subscribe       { email, lang, seq?, website?(honeypot), source? } → lien de téléchargement immédiat
 *   GET  /api/pack/download        ?t=<jeton>&lang=fr|en → zip depuis R2 (liaison PACK)
 *   GET|POST /api/pack/unsubscribe ?t=<jeton de désinscription> → plus aucun email
 *
 * Séquence (seulement si la case « 2 emails de plus » est cochée) : email 1 = le lien du pack (tout de suite),
 * email 2 = une astuce (J+3), email 3 = l'offre (J+7), puis plus rien. Envoi par l'API transactionnelle de Brevo.
 * Données : email, langue, consentement, dates d'envoi. Jamais l'adresse IP (hash éphémère de 60 s dans KV).
 * Active seulement quand les secrets sont présents : BREVO_API_KEY (secret) et MAIL_FROM_EMAIL (variable).
 */

const DAY = 86400000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HEADERS = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: HEADERS });

export const emailsEnabled = (env) => Boolean(env.BREVO_API_KEY && env.MAIL_FROM_EMAIL);

function token(bytes = 18) {
  const b = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hashIp(ip) {
  const data = new TextEncoder().encode(`retrodeck-pack:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const sqlTime = (s) => Date.parse(String(s).replace(' ', 'T') + 'Z');

/* ---------- séquence : quel email envoyer, ou sauter, à quel moment ---------- */
export function dueStep(row, now = Date.now()) {
  if (!row.seq || row.unsub_at) return null;
  const age = (now - sqlTime(row.created_at)) / DAY;
  if (!row.e1_at) return { step: 1, action: age <= 2 ? 'send' : 'skip' };
  if (!row.e2_at) { if (age < 3) return null; return { step: 2, action: age <= 17 ? 'send' : 'skip' }; }
  if (!row.e3_at) { if (age < 7) return null; return { step: 3, action: age <= 21 ? 'send' : 'skip' }; }
  return null;
}

/* ---------- textes des emails ---------- */
const SIGN = 'Stéphane E., LastParadox (développeur indépendant) · support@lastparadox.xyz';
const COPY = {
  fr: {
    1: (u) => ({
      subject: 'Ton pack de 50 fiches (RETRO-DECK)',
      text: `Salut,\n\nVoici ton pack de 50 fiches (Git, SQL, Rust, Python, JavaScript) :\n${u.dl}\n\nPour l'utiliser : dézippe le dossier, puis dans RETRO-DECK ouvre Révision > Importer mes .md en fiches (ou copie le dossier dans ton coffre Obsidian). Importe-en une dizaine à la fois.\n\nTu as demandé 2 emails de plus, et c'est tout :\n- dans 3 jours : une astuce (le Parking) ;\n- dans 7 jours : l'offre RETRO-DECK.\nAprès ça, plus rien.\n\nSe désinscrire en un clic : ${u.unsub}\n\n${SIGN}`,
    }),
    2: (u) => ({
      subject: 'Une astuce : garer une pensée parasite',
      text: `Salut,\n\nUne idée qui n'a rien à voir te traverse en plein travail ? Au lieu d'ouvrir un onglet et de perdre ton fil : Ctrl+Espace, tu la tapes, Entrée. Elle est notée à part (dans parking.md) et tu restes dans ton texte. Tu la tries plus tard.\n\nTu peux l'essayer dans ton navigateur, sans rien installer :\n${u.origin}/essayer/\n\nProchain et dernier email dans 4 jours.\n\nSe désinscrire en un clic : ${u.unsub}\n\n${SIGN}`,
    }),
    3: (u) => ({
      subject: "RETRO-DECK : l'offre de lancement (dernier email)",
      text: `Salut,\n\nRETRO-DECK est un carnet de travail calme pour Windows : trois tâches par jour, une seule chose à la fois, tes notes en fichiers .md sur ton PC. Pas de compte, pas d'abonnement.\n\nPaiement unique : Soutien 5 €, prix de lancement 14 €, licence 19 €. Remboursement si le logiciel ne fonctionne pas sur ton ordinateur.\n${u.origin}/campagne?from=pack#paliers\n\nC'est le dernier email : tu n'en recevras plus d'autre.\n\nSe désinscrire : ${u.unsub}\n\n${SIGN}`,
    }),
  },
  en: {
    1: (u) => ({
      subject: 'Your pack of 50 cards (RETRO-DECK)',
      text: `Hi,\n\nHere is your pack of 50 cards (Git, SQL, Rust, Python, JavaScript):\n${u.dl}\n\nTo use it: unzip the folder, then in RETRO-DECK open Review > Import my .md files as cards (or copy the folder into your Obsidian vault). Import about ten at a time.\n\nYou asked for 2 more emails, and that is all:\n- in 3 days: a tip (the Parking);\n- in 7 days: the RETRO-DECK offer.\nAfter that, nothing more.\n\nUnsubscribe in one click: ${u.unsub}\n\n${SIGN}`,
    }),
    2: (u) => ({
      subject: 'A tip: park a stray thought',
      text: `Hi,\n\nAn unrelated idea pops up in the middle of your work? Instead of opening a tab and losing your thread: Ctrl+Space, type it, Enter. It is noted aside (in parking.md) and you stay in your text. You sort it later.\n\nYou can try it in your browser, nothing to install:\n${u.origin}/essayer/\n\nNext and last email in 4 days.\n\nUnsubscribe in one click: ${u.unsub}\n\n${SIGN}`,
    }),
    3: (u) => ({
      subject: 'RETRO-DECK: the launch offer (last email)',
      text: `Hi,\n\nRETRO-DECK is a calm work notebook for Windows: three tasks a day, one thing at a time, your notes as .md files on your PC. No account, no subscription.\n\nOne-time payment: Support €5, launch price €14, license €19. Refund if the software does not work on your computer.\n${u.origin}/campagne?from=pack#paliers\n\nThis is the last email: you will not receive any other.\n\nUnsubscribe: ${u.unsub}\n\n${SIGN}`,
    }),
  },
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function htmlFromText(text) {
  return '<div style="font:15px/1.6 Arial,sans-serif;color:#111;max-width:560px">' +
    text.split('\n\n').map((p) => '<p style="margin:0 0 14px">' + esc(p).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>').replace(/\n/g, '<br>') + '</p>').join('') + '</div>';
}

export function buildEmail(step, lang, { origin, dl, unsub }) {
  const l = lang === 'en' ? 'en' : 'fr';
  const { subject, text } = COPY[l][step]({ origin, dl, unsub });
  return { subject, text, html: htmlFromText(text) };
}

/* ---------- envoi (Brevo, API transactionnelle) ---------- */
export async function sendBrevo(env, { to, subject, text, html, unsubUrl }) {
  const r = await fetch(env.BREVO_URL || 'https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: env.MAIL_FROM_NAME || 'LastParadox', email: env.MAIL_FROM_EMAIL },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html,
      headers: { 'List-Unsubscribe': `<${unsubUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
    }),
  });
  return r.ok;
}

const origin = (env) => env.SITE_ORIGIN || 'https://retrodeck.lastparadox.dev';
const dlUrl = (env, row) => `${origin(env)}/api/pack/download?t=${row.dl_token}&lang=${row.lang}`;
const unsubUrl = (env, row) => `${origin(env)}/api/pack/unsubscribe?t=${row.unsub_token}`;

async function deliver(env, row, step) {
  const mail = buildEmail(step, row.lang, { origin: origin(env), dl: dlUrl(env, row), unsub: unsubUrl(env, row) });
  const ok = await sendBrevo(env, { to: row.email, ...mail, unsubUrl: unsubUrl(env, row) });
  if (ok) await env.DB.prepare(`UPDATE pack_subscribers SET e${step}_at = datetime('now') WHERE id = ?`).bind(row.id).run();
  return ok;
}

/** Appelé chaque jour par le déclencheur planifié : envoie ou saute les emails 2 et 3 (et retente le 1). */
export async function runSequence(env, now = Date.now()) {
  if (!emailsEnabled(env)) return { sent: 0, skipped: 0 };
  const { results } = await env.DB.prepare(
    'SELECT * FROM pack_subscribers WHERE seq = 1 AND unsub_at IS NULL AND e3_at IS NULL ORDER BY id LIMIT 100'
  ).all();
  let sent = 0, skipped = 0;
  for (const row of results || []) {
    const due = dueStep(row, now);
    if (!due) continue;
    if (due.action === 'skip') {
      await env.DB.prepare(`UPDATE pack_subscribers SET e${due.step}_at = 'skipped' WHERE id = ?`).bind(row.id).run();
      skipped++;
    } else if (await deliver(env, row, due.step)) {
      sent++;
    }
  }
  return { sent, skipped };
}

/* ---------- routes ---------- */
const page = (title, body) =>
  new Response(`<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><body style="font:16px/1.6 ui-monospace,Consolas,monospace;background:#ecebe6;color:#111;max-width:34em;margin:12vh auto;padding:0 20px"><h1 style="font-size:22px">${title}</h1><p>${body}</p><p><a href="/" style="color:#111">retrodeck.lastparadox.dev</a></p>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });

export async function handlePack(request, env, ctx, url) {
  const p = url.pathname;
  if (!p.startsWith('/api/pack/')) return null;

  if (p === '/api/pack/config' && request.method === 'GET') return json({ emails: emailsEnabled(env) });

  if (p === '/api/pack/subscribe') {
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
    if (!emailsEnabled(env)) return json({ error: 'unavailable' }, 503);
    let body;
    try { body = await request.json(); } catch { return json({ error: 'bad_request' }, 400); }
    if (body.website) return json({ ok: true });                       // honeypot
    const email = String(body.email || '').trim().toLowerCase();
    if (email.length > 254 || !EMAIL_RE.test(email)) return json({ error: 'invalid_email' }, 400);
    const lang = body.lang === 'en' ? 'en' : 'fr';
    const seq = body.seq === true ? 1 : 0;
    const source = String(body.source || '').slice(0, 40);

    const key = 'pk:' + (await hashIp(request.headers.get('CF-Connecting-IP') || 'unknown'));
    if (await env.RL.get(key)) return json({ error: 'too_many_requests' }, 429);
    await env.RL.put(key, '1', { expirationTtl: 60 });

    let row;
    try {
      row = await env.DB.prepare('SELECT * FROM pack_subscribers WHERE email = ?').bind(email).first();
      if (row) {
        await env.DB.prepare(
          "UPDATE pack_subscribers SET lang = ?, seq = CASE WHEN ? = 1 THEN 1 ELSE seq END, consent_at = CASE WHEN ? = 1 THEN datetime('now') ELSE consent_at END, unsub_at = CASE WHEN ? = 1 THEN NULL ELSE unsub_at END WHERE id = ?"
        ).bind(lang, seq, seq, seq, row.id).run();
        row = await env.DB.prepare('SELECT * FROM pack_subscribers WHERE id = ?').bind(row.id).first();
      } else {
        await env.DB.prepare(
          "INSERT INTO pack_subscribers (email, lang, seq, dl_token, unsub_token, source, consent_at) VALUES (?, ?, ?, ?, ?, ?, CASE WHEN ? = 1 THEN datetime('now') END)"
        ).bind(email, lang, seq, token(), token(), source, seq).run();
        row = await env.DB.prepare('SELECT * FROM pack_subscribers WHERE email = ?').bind(email).first();
      }
    } catch {
      return json({ error: 'server_error' }, 500);
    }
    // Email 1 (le lien du pack) seulement si la personne a demandé les emails et qu'il n'est pas déjà parti.
    if (row.seq === 1 && !row.e1_at && !row.unsub_at) ctx.waitUntil(deliver(env, row, 1).catch(() => false));
    return json({ ok: true, dl: `/api/pack/download?t=${row.dl_token}&lang=${lang}`, dlAlt: `/api/pack/download?t=${row.dl_token}&lang=${lang === 'fr' ? 'en' : 'fr'}`, seq: seq === 1 });
  }

  if (p === '/api/pack/download' && request.method === 'GET') {
    const t = url.searchParams.get('t') || '';
    const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'fr';
    if (!/^[A-Za-z0-9_-]{16,40}$/.test(t)) return json({ error: 'not_found' }, 404);
    const row = await env.DB.prepare('SELECT id FROM pack_subscribers WHERE dl_token = ?').bind(t).first();
    if (!row) return json({ error: 'not_found' }, 404);
    const obj = await env.PACK.get(`pack-${lang}.zip`);
    if (!obj) return json({ error: 'not_found' }, 404);
    const name = lang === 'en' ? 'RETRO-DECK-starter-cards-developer-EN.zip' : 'RETRO-DECK-pack-fiches-developpeur-FR.zip';
    return new Response(obj.body, {
      headers: { 'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="${name}"`, 'Content-Length': String(obj.size), 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
    });
  }

  if (p === '/api/pack/unsubscribe' && (request.method === 'GET' || request.method === 'POST')) {
    const t = url.searchParams.get('t') || '';
    if (!/^[A-Za-z0-9_-]{16,40}$/.test(t)) return page('Lien invalide', 'Ce lien de désinscription n’est pas valide. / This unsubscribe link is not valid.');
    const row = await env.DB.prepare('SELECT id, lang FROM pack_subscribers WHERE unsub_token = ?').bind(t).first();
    if (!row) return page('Lien invalide', 'Ce lien de désinscription n’est pas valide. / This unsubscribe link is not valid.');
    await env.DB.prepare("UPDATE pack_subscribers SET seq = 0, unsub_at = COALESCE(unsub_at, datetime('now')) WHERE id = ?").bind(row.id).run();
    if (request.method === 'POST') return json({ ok: true });
    return row.lang === 'en'
      ? page('You are unsubscribed', 'You will not receive any more emails from this pack. Your pack download link still works.')
      : page('Tu es désinscrit·e', 'Tu ne recevras plus aucun email de ce pack. Ton lien de téléchargement continue de fonctionner.');
  }

  return json({ error: 'not_found' }, 404);
}
