import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEmail, dueStep, emailsEnabled } from '../src/pack.js';

const ctx = { origin: 'https://x.test', dl: 'https://x.test/api/pack/download?t=DL&lang=fr', unsub: 'https://x.test/api/pack/unsubscribe?t=UN' };
const iso = (daysAgo, now) => new Date(now - daysAgo * 86400000).toISOString().slice(0, 19).replace('T', ' ');

test('emailsEnabled demande la clé ET l\'expéditeur', () => {
  assert.equal(emailsEnabled({}), false);
  assert.equal(emailsEnabled({ BREVO_API_KEY: 'k' }), false);
  assert.equal(emailsEnabled({ MAIL_FROM_EMAIL: 'a@b.c' }), false);
  assert.equal(emailsEnabled({ BREVO_API_KEY: 'k', MAIL_FROM_EMAIL: 'a@b.c' }), true);
});

test('les 6 emails existent, contiennent le lien de désinscription et aucun « undefined »', () => {
  for (const lang of ['fr', 'en']) for (const step of [1, 2, 3]) {
    const m = buildEmail(step, lang, ctx);
    assert.ok(m.subject.length > 5);
    assert.ok(m.text.includes(ctx.unsub), `${lang} ${step} : désinscription`);
    assert.ok(m.html.includes(ctx.unsub));
    assert.ok(!/undefined|\[object/.test(m.text + m.html));
  }
  assert.ok(buildEmail(1, 'fr', ctx).text.includes(ctx.dl));
  assert.ok(buildEmail(2, 'en', ctx).text.includes('/essayer/'));
  assert.ok(buildEmail(3, 'fr', ctx).text.includes('from=pack'));
  assert.ok(/dernier email/i.test(buildEmail(3, 'fr', ctx).text));
});

test('l\'email 1 annonce exactement les 2 emails suivants', () => {
  const fr = buildEmail(1, 'fr', ctx).text;
  assert.ok(fr.includes('dans 3 jours') && fr.includes('dans 7 jours') && fr.includes('plus rien'));
  const en = buildEmail(1, 'en', ctx).text;
  assert.ok(en.includes('in 3 days') && en.includes('in 7 days') && en.includes('nothing more'));
});

test('dueStep : séquence J0, J+3, J+7, puis rien', () => {
  const now = Date.parse('2026-11-10T08:00:00Z');
  const row = (age, extra = {}) => ({ seq: 1, unsub_at: null, created_at: iso(age, now), e1_at: null, e2_at: null, e3_at: null, ...extra });
  assert.deepEqual(dueStep(row(0.1), now), { step: 1, action: 'send' });
  assert.deepEqual(dueStep(row(5), now), { step: 1, action: 'skip' });                       // email 1 jamais parti, trop tard
  assert.equal(dueStep(row(2, { e1_at: 'x' }), now), null);
  assert.deepEqual(dueStep(row(3.2, { e1_at: 'x' }), now), { step: 2, action: 'send' });
  assert.deepEqual(dueStep(row(30, { e1_at: 'x' }), now), { step: 2, action: 'skip' });     // activé très tard : on ne spamme pas
  assert.equal(dueStep(row(5, { e1_at: 'x', e2_at: 'x' }), now), null);
  assert.deepEqual(dueStep(row(7.1, { e1_at: 'x', e2_at: 'x' }), now), { step: 3, action: 'send' });
  assert.equal(dueStep(row(9, { e1_at: 'x', e2_at: 'x', e3_at: 'x' }), now), null);
});

test('dueStep : pas d\'email sans consentement ni après désinscription', () => {
  const now = Date.now();
  assert.equal(dueStep({ seq: 0, unsub_at: null, created_at: iso(4, now), e1_at: 'x' }, now), null);
  assert.equal(dueStep({ seq: 1, unsub_at: '2026-01-01 00:00:00', created_at: iso(4, now), e1_at: 'x' }, now), null);
});

test('le texte est échappé dans la version HTML', () => {
  const m = buildEmail(1, 'fr', { ...ctx, dl: 'https://x.test/?a=1&b=<b>' });
  assert.ok(!m.html.includes('<b>'));
  assert.ok(m.html.includes('&lt;b&gt;'));
});
