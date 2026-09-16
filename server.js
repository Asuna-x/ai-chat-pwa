/* Iris v4.82 — minimal Vision proxy backend. Requires Node.js 18+. */
const http = require('http');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '0.0.0.0';
const ZHIPU_BASE = (process.env.VISION_API_BASE || 'https://open.bigmodel.cn/api/paas/v4').replace(/\/+$/, '');
const API_KEY = String(process.env.ZHIPU_API_KEY || '').trim();
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const MAX_BODY_BYTES = Number(process.env.MAX_BODY_BYTES || 8 * 1024 * 1024);

function send(res, status, data) {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.end(body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0, chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('请求体过大。'), { code: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
      catch { reject(Object.assign(new Error('请求 JSON 无效。'), { code: 400 })); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, '');
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'GET' && url.pathname === '/health') {
    return send(res, 200, { ok: true, version: '4.82', apiKeyConfigured: Boolean(API_KEY) });
  }
  if (req.method !== 'POST' || url.pathname !== '/api/vision') {
    return send(res, 404, { error: 'Not found' });
  }
  if (!API_KEY) return send(res, 500, { error: '服务器未配置 ZHIPU_API_KEY。' });

  try {
    const input = await readJson(req);
    const model = String(input.model || 'GLM-4.6V-Flash').trim();
    const messages = Array.isArray(input.messages) ? input.messages : [];
    if (!messages.length) return send(res, 400, { error: 'messages 不能为空。' });

    const body = {
      model,
      messages,
      temperature: Number(input.temperature ?? 0.2),
      stream: false
    };
    if (input.max_tokens != null) body.max_tokens = Number(input.max_tokens);

    const upstream = await fetch(`${ZHIPU_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(body)
    });
    const raw = await upstream.text();
    res.statusCode = upstream.status;
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.end(raw);
  } catch (err) {
    console.error('[Iris Vision Proxy]', err);
    send(res, err.code || 502, { error: err.message || String(err) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Iris v4.82 Vision Proxy listening on http://${HOST}:${PORT}`);
  console.log(`Upstream: ${ZHIPU_BASE}/chat/completions`);
});
