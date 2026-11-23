const CACHE_NAME = "umwa8982-v1";

const APP_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/assets/css/site.css",
  "/assets/js/local8982.js",
  "/assets/images/umwa-logo.png",
  "/assets/images/icon-192.png",
  "/assets/images/icon-512.png"
];

/* Install and cache the basic app files */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_ASSETS))
  );

  self.skipWaiting();
});

/* Remove old caches when we update the app */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );

  self.clients.claim();
});

/* Network first, cached copy as a fallback */
self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {

        const copy = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, copy));

        return 
