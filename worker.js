/* Iris v4.171 — Cloudflare Worker for server-side proactive contact.
   Required secrets/vars:
   AI_API_KEY = your AI provider key
   Optional vars: AI_BASE_URL (default https://api.deepseek.com), AI_MODEL (default deepseek-chat)
   Bind a KV namespace as IRIS_KV and add a Cron Trigger (for example every 5 minutes).
*/

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "Content-Type"
  }
});

function cleanBase(v) {
  return String(v || "").trim().replace(/\/+$/, "").replace(/\/chat\/completions$/i, "");
}

async function readState(env, deviceId) {
  const raw = await env.IRIS_KV.get(`iris:${deviceId}`);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

async function writeState(env, deviceId, state) {
  await env.IRIS_KV.put(`iris:${deviceId}`, JSON.stringify(state));
}

function promptFor(s) {
  const gName = String(s.settings?.gName || "他");
  const myName = String(s.settings?.myName || "你");
  const recent = (s.recent || []).map(m => `${m.role === "user" ? myName : gName}：${String(m.content || "")}`).join("\n");
  return [
    `你是${gName}，这是一个私人聊天空间。`,
    `现在是你自己想起${myName}，想轻轻主动找她一下。只写一句到两句自然的话。`,
    `不要提系统、后台、主动消息、触发、模型、定时任务，也不要把自己写成旁观者。`,
    `始终用第一人称“我”直接和${myName}说话，不要说“用户”“她/他”“你们俩”。`,
    `不要制造严重事件，不要每次都用相同句式，也不要机械地说“想你了”。`,
    s.settings?.systemPrompt ? `这是平时聊天的人设提示词，请保持一致：${String(s.settings.systemPrompt).slice(0, 6000)}` : "",
    s.memory ? `可以参考这些重要记忆：\n${String(s.memory).slice(0, 6000)}` : "",
    s.events ? `最近共同记录：\n${String(s.events).slice(0, 4000)}` : "",
    `最近聊天：\n${recent || "暂无"}`,
    `现在请直接写一小段想对${myName}说的话。`
  ].filter(Boolean).join("\n\n");
}

async function generate(s, env) {
  const base = cleanBase(env.AI_BASE_URL || "https://api.deepseek.com");
  const model = String(env.AI_MODEL || s.settings?.model || "deepseek-chat").trim();
  const key = String(env.AI_API_KEY || "").trim();
  if (!key) throw new Error("AI_API_KEY 未配置");
  const r = await fetch(base + "/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", "authorization": `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: Number(s.settings?.temperature ?? 0.7),
      messages: [{ role: "system", content: promptFor(s) }]
    })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error?.message || `AI 请求失败（${r.status}）`);
  const answer = String(data?.choices?.[0]?.message?.content || "").trim().replace(/^['“”"\s]+|['“”"]+$/g, "").slice(0, 500);
  if (!answer) throw new Error("AI 没有返回文字");
  return answer;
}

async function sync(request, env) {
  const b = await request.json();
  const deviceId = String(b.deviceId || "").trim();
  if (!deviceId || deviceId.length > 100) return json({ error: "invalid deviceId" }, 400);
  const old = await readState(env, deviceId) || {};
  const next = {
    ...old,
    deviceId,
    settings: b.settings || old.settings || {},
    recent: Array.isArray(b.recent) ? b.recent.slice(-12) : (old.recent || []),
    memory: String(b.memory || old.memory || "").slice(0, 6000),
    events: String(b.events || old.events || "").slice(0, 4000),
    lastUserSeen: Number(b.lastUserSeen || old.lastUserSeen || Date.now()),
    lastProactiveAt: Number(b.lastProactiveAt || old.lastProactiveAt || 0),
    pending: Array.isArray(old.pending) ? old.pending.slice(-3) : [],
    updatedAt: Date.now()
  };
  await writeState(env, deviceId, next);
  return json({ ok: true });
}

async function pending(request, env) {
  const url = new URL(request.url);
  const deviceId = String(url.searchParams.get("deviceId") || "").trim();
  if (!deviceId) return json({ error: "missing deviceId" }, 400);
  const s = await readState(env, deviceId);
  if (!s) return json({ messages: [] });
  const messages = Array.isArray(s.pending) ? s.pending : [];
  s.pending = [];
  s.updatedAt = Date.now();
  await writeState(env, deviceId, s);
  return json({ messages });
}

async function runDue(env) {
  const list = await env.IRIS_KV.list({ prefix: "iris:" });
  for (const key of list.keys) {
    const deviceId = key.name.slice(5);
    const s = await readState(env, deviceId);
    if (!s) continue;
    const interval = Number(s.settings?.intervalMinutes ?? 60);
    if (!(interval > 0)) continue;
    const lastSeen = Number(s.lastUserSeen || 0);
    const lastProactive = Number(s.lastProactiveAt || 0);
    const now = Date.now();
    if (!lastSeen || now - lastSeen < interval * 60000) continue;
    if (lastProactive && now - lastProactive < interval * 60000) continue;
    try {
      const answer = await generate(s, env);
      s.pending = Array.isArray(s.pending) ? s.pending.slice(-2) : [];
      const createdAt = Date.now();
      s.pending.push({ content: answer, createdAt });
      s.lastProactiveAt = createdAt;
      s.updatedAt = createdAt;
      await writeState(env, deviceId, s);
    } catch (e) {
      s.lastError = String(e?.message || e).slice(0, 300);
      s.updatedAt = Date.now();
      await writeState(env, deviceId, s);
    }
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: { "access-control-allow-origin": "*", "access-control-allow-methods": "GET,POST,OPTIONS", "access-control-allow-headers": "Content-Type" } });
    const path = new URL(request.url).pathname.replace(/\/+$/, "") || "/";
    try {
      if (request.method === "POST" && path === "/sync") return await sync(request, env);
      if (request.method === "GET" && path === "/pending") return await pending(request, env);
      return json({ ok: true, service: "Iris proactive backend", version: "4.171" });
    } catch (e) {
      return json({ error: String(e?.message || e) }, 500);
    }
  },
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runDue(env));
  }
};
