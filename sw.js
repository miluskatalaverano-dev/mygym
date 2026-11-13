const CACHE = "migym-v1";
const CORE = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
const LIB = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).then(() => c.add(LIB).catch(() => {}))));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (e.request.mode === "navigate"){
    // primero la red (para recibir mejoras), si no hay conexión la copia guardada
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put("./index.html", cp)); return r; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(r => {
    if (r.ok || r.type === "opaque"){ const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
    return r;
  })));
});
