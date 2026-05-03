const CACHE_NAME = 'culinary-master-v4';
const ASSETS = [
  '/culinary-roadmap/',
  '/culinary-roadmap/index.html',
  '/culinary-roadmap/css/style.css',
  '/culinary-roadmap/js/app.js',
  '/culinary-roadmap/js/roadmap.js',
  '/culinary-roadmap/js/recipe.js',
  '/culinary-roadmap/js/api.js',
  '/culinary-roadmap/data/recipes.json',
];

// インストール時にキャッシュへ保存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// キャッシュ優先・なければネットワーク取得
self.addEventListener('fetch', (event) => {
  // Claude API への通信はキャッシュしない
  if (event.request.url.includes('api.anthropic.com')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
