const C="g-chat-v4-33";
const A=["./","./index.html","./style.css","./app.js","./api.js","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>e.waitUntil(self.skipWaiting()));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;if(/\/(?:index\.html|app\.js|api\.js|style\.css|sw\.js)(?:$|\?)/.test(new URL(e.request.url).pathname))return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));});
