'use strict';

const CACHE_NAME = 'movie-maker-v1';

const FILES_TO_CACHE = [

    'images/icons/favicon.ico',
    'images/logo.png',
    'images/bg2.jpg',
    'css/styles.css',
    'bootstrap/css/bootstrap.min.css',
    'bootstrap/css/bootstrap.min.css.map',
    'bootstrap/js/bootstrap.min.js',
    'bootstrap/js/bootstrap.min.js.map',
    'js/jquery-3.5.1.min.js',
    'js/popper.min.js',
    'js/popper.min.js.map',
    'offline.html'

];

//Instala o service worker no browser
self.addEventListener('install', (evt) => {

    console.log('[ServiceWorker] Instalando...');

    evt.waitUntil(

        caches.open(CACHE_NAME).then((cache) => {

            console.log('[ServiceWorker] Fazendo cache dos arquivos da aplicação');
            return cache.addAll(FILES_TO_CACHE);
        })

    );
    self.skipWaiting();
});

//Responder a versão offline do app
self.addEventListener('fetch', (evt) => {

    console.log('[ServiceWorker-Offline-Decisor] Recebendo', evt.request.url);

    if (evt.request.mode !== 'navigate') {
        console.log("evt.request.mode", evt.request.mode)
        return;
    }
    evt.respondWith(
        fetch(evt.request)
            .catch(() => {
                return caches.open(CACHE_NAME)
                    .then((cache) => {
                        return cache.match('offline.html');
                    });
            })
    );

});


self.addEventListener('activate', function(event) {
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.filter(function(cacheName) {
            return true
          }).map(function(cacheName) {
            if(cacheName !== CACHE_NAME){
                return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });
