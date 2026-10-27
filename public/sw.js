// Service worker: siempre red primero (sin la caché HTTP de GitHub Pages) y caché solo de respaldo sin conexión.
const CACHE = "fretquest-v3";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // Los archivos de /_next/static/ llevan hash en el nombre: nunca cambian, pueden salir de la caché.
  const immutable = url.pathname.startsWith("/_next/static/");
  e.respondWith(
    (immutable ? caches.match(e.request) : Promise.resolve(undefined)).then((hit) => hit || fetch(e.request, { cache: immutable ? "default" : "no-store" })
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: e.request.mode === "navigate" })
        .then((r) => r || (e.request.mode === "navigate" ? caches.match("/") : undefined))
        .then((r) => r || Response.error()))),
  );
});
