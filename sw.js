const CACHE_NAME = "iris-shell-v20260915-44-43";

self.addEventListener("install", event => { self.skipWaiting(); });
self.addEventListener("activate", event => { event.waitUntil((async () => { const keys = await caches.keys(); await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))); await self.clients.claim(); })()); });
self.addEventListener("fetch", event => { const req = event.request; if (req.method !== "GET") return; const url = new URL(req.url); if (url.origin !== self.location.origin) return; event.respondWith((async () => { try { const fresh = await fetch(req, { cache: "no-store" }); const cache = await caches.open(CACHE_NAME); cache.put(req, fresh.clone()).catch(() => {}); return fresh; } catch (err) { const cached = await caches.match(req); if (cached) return cached; throw err; } })()); });
