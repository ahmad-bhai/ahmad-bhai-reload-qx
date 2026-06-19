// Achatgram service worker
// This file MUST sit in the same folder as index.html.
// Browsers will not let a page register a service worker from an
// inline/blob script (security restriction), so this small separate
// file is the one unavoidable exception to "single file" — everything
// else (UI, login, chat logic) lives entirely inside index.html.

const CACHE = "achatgram-shell-v1";
const SHELL = ["./", "./index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Never cache Telegram API/CDN traffic — only the app shell itself.
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => cached);
    })
  );
});
