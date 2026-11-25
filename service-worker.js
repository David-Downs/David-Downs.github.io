const CACHE_NAME = "umwa8982-v4";

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
    caches.open(CACHE_NAME).then(async cache => {
      for (const asset of APP_ASSETS) {
        try {
          await cache.add(asset);
        } catch (error) {
          console.warn(
            "Could not cache asset:",
            asset,
            error
          );
        }
      }
    })
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

return response;
})
.catch(() => caches.match(event.request))
);
});

/* =========================================================
   PUSH NOTIFICATIONS
   ========================================================= */

self.addEventListener("push", event => {
  let data = {
    title: "UMWA Local 8982",
    body: "You have a new Local 8982 notification.",
    url: "/"
  };

  if (event.data) {
    try {
      const incoming = event.data.json();

      data = {
        title: incoming.title || data.title,
        body: incoming.body || data.body,
        url: incoming.url || data.url
      };
    } catch (error) {
      console.error("Unable to read push notification:", error);
    }
  }

  const options = {
    body: data.body,
    icon: "/assets/images/icon-192.png",
    badge: "/assets/images/icon-192.png",
    data: {
      url: data.url
    },
    tag: "umwa8982-notification"
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});


/* Open the Local 8982 app when a notification is tapped */

self.addEventListener("notificationclick", event => {
  event.notification.close();

  const destination =
    event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(clientList => {

      /* If UMWA 8982 is already open, focus it */
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(destination);
          return client.focus();
        }
      }

      /* Otherwise open the PWA */
      if (clients.openWindow) {
        return clients.openWindow(destination);
      }
    })
  );
});
