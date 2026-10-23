// Service worker mínimo: red primero y caché de respaldo, para que la app abra sin conexión.
const CACHE = "fretquest-v2";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // SPA: cualquier navegación sin red cae en el index.html guardado.
  const key = e.request.mode === "navigate" ? "/index.html" : e.request;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(key, copy));
        }
        return res;
      })
      .catch(() => caches.match(key).then((r) => r || Response.error())),
  );
});
