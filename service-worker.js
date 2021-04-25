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
    'offline.html',

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

//Gera o CACHE dos arquivos estáticos
self.addEventListener('activate', (evt) => {

    console.log('[ServiceWorker] Ativando...');

    evt.waitUntil(

        caches.keys().then((keylist) => {

            return Promise.all(keylist.map((key) => {

                //console.log('[ServiceWorker] Removendo cache antigo...');
                if(key !== CACHE_NAME){
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});

//Responder a versão offline do app
self.addEventListener('fetch', (event) => {

    event.respondWith((async() => {

        const cache = await caches.open(CACHE_NAME);
    
        try {
            const cachedResponse = await cache.match(event.request);
            if(cachedResponse) {
                console.log('cachedResponse: ', event.request.url);
                return cachedResponse;
            }
    
            const fetchResponse = await fetch(event.request);
            if(fetchResponse) {
                console.log('fetchResponse: ', event.request.url);
                await cache.put(event.request, fetchResponse.clone());
                return fetchResponse;
            }
        }   catch (error) {
            console.log('Fetch failed: ', error);
            const cachedResponse = await cache.match('/offline.html');
            return cachedResponse;
        }
      })());

    /*
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
    */

});
