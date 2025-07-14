self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("weather-app").then(cache =>
      cache.addAll([
        "./", "./index.html", "./style.css",
        "./java.js", "./manifest.json",
        "./favicon.png",
        "icons/icon-192.png", "icons/icon-512.png"
      ])
    )
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
