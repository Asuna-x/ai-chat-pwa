/* Iris v4.130 — non-blocking PWA service worker. */
const CACHE_NAME="iris-shell-v4.130";
self.addEventListener("install",e=>e.waitUntil(self.skipWaiting()));
self.addEventListener("activate",e=>e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));await self.clients.claim()})()));
self.addEventListener("fetch",e=>{
 const r=e.request;if(r.method!=="GET")return;
 const u=new URL(r.url);if(u.origin!==self.location.origin)return;
 const root=new URL("./",self.location.href).pathname;
 if(u.pathname!==root&&!/\.(html|js|css|webmanifest)$/i.test(u.pathname))return;
 e.respondWith(fetch(r,{cache:"no-store"}).catch(()=>caches.match(r)));
});
