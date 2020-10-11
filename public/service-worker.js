const APP_PREFIX = 'budget-tracker-';
const VERSION = 'v1';
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = 'data-cache-' + VERSION;


// const CACHE_NAME = "budget-tracker-1"; 
// const DATA_CACHE_NAME = "data-budget-tracker-1"; 

const FILES_TO_CACHE = [
    '/',
    '/manifest.json', 
    '/index.html', 
    '/css/styles.css',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png', 
    '/js/idb.js', 
    '/js/index.js'
]; 

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('pre-cache successful!'); 
            return cache.addAll(FILES_TO_CACHE);
        })
    )
})

self.addEventListener('activate', function(e) {
    e.waitUntil(
      caches.keys().then(function(keyList) {
        let cacheKeeplist = keyList.filter(function(key) {
          return key.indexOf(APP_PREFIX);
        });
        cacheKeeplist.push(CACHE_NAME);
  
        return Promise.all(
          keyList.map(function(key, i) {
            if (cacheKeeplist.indexOf(key) === -1) {
              console.log('deleting cache : ' + keyList[i]);
              return caches.delete(keyList[i]);
            }
          })
        );
      })
    );
  });

self.addEventListener('fetch', function(e) {
    if(e.request.url.includes('/api/')) {
        e.respondWith(
            caches
            .open(DATA_CACHE_NAME)
            .then(cache => {
                return fetch(e.request)
                .then(response => {
                    if(response.status === 200) {
                        cache.put(e.request.url, response.clone())
                    }     
                    return response;
                })
                .catch(err => {
                    return cache.match(e.request);
                })
            })
            .catch(err => console.log(err))
        )
        return;
    }
    e.respondWith(
        fetch(e.request).catch(function() {
            return caches.match(e.request).then(function (response){
                if(response) {
                    return response; 
                } else if (e.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/');
                }
            });
        })
    )
})