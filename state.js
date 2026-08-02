// /api/state — shared storage for the dashboard.
//
// GET  -> returns the whole saved state object ({} if nothing saved yet)
// POST -> merges the JSON body into the saved state object and saves it
//
// Requires a Vercel KV (Upstash Redis) store connected to this project,
// which injects KV_REST_API_URL / KV_REST_API_TOKEN automatically.
// See README.md for the one-time setup steps.
import { kv } from '@vercel/kv';

const STORE_KEY = 'cpv:dashboard:v1';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = (await kv.get(STORE_KEY)) || {};
      res.status(200).json(data);
      return;
    }

    if (req.method === 'POST') {
      let incoming = req.body;
      // On some runtimes req.body arrives as a raw string.
      if (typeof incoming === 'string') {
        incoming = incoming.length ? JSON.parse(incoming) : {};
      }
      incoming = incoming || {};

      const current = (await kv.get(STORE_KEY)) || {};
      const merged = Object.assign({}, current, incoming);
      await kv.set(STORE_KEY, merged);
      res.status(200).json({ ok: true });
      return;
    }

    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    console.error('/api/state error:', err);
    res.status(500).json({
      error: 'state_store_unavailable',
      detail: String((err && err.message) || err)
    });
  }
}
