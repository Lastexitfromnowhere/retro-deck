# Website source / Source du site

Static pages (French and English in the same files, switched by a button) plus a Cloudflare Worker that only answers `/api/*` (the waitlist).

- `public/` — pages, `assets/epaper.css` (the charter), `assets/site.js` (language + waitlist form), security headers in `_headers`.
- `src/index.js` — the Worker: `POST /api/waitlist`, `GET /api/health`. Stores email, language, source and date in D1; never the IP.
- `schema.sql` — the D1 table.
- `wrangler.example.toml` — copy to `wrangler.toml` and fill in your own Cloudflare ids.

```bash
npm install
npx wrangler d1 create retrodeck-waitlist
npx wrangler kv namespace create RL
npx wrangler d1 execute retrodeck-waitlist --remote --file schema.sql
npx wrangler deploy
```

Production: https://retrodeck.lastparadox.dev
