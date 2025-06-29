const CACHE_NAME = 'mpds-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
  console.log('Opened cache');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Filter out chrome-extension URLs and other unsupported schemes
        const validUrls = urlsToCache.filter(url => {
          try {
            new URL(url, self.location.origin);
            return true;
          } catch (e) {
            console.warn('Invalid URL for cache:', url);
            return false;
          }
        });
        return cache.addAll(validUrls);
      })
      .catch(error => {
        console.error('Cache addAll failed:', error);
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Return offline page if both cache and network fail
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle cache updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nuevo entrenamiento disponible',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-72x72.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Entrenamiento',
        icon: '/icons/icon-72x72.svg'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icons/icon-72x72.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('MPDS Streetlifting', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/workout-logger/Push')
    );
  }
});

// Background sync function
async function doBackgroundSync() {
  try {
    // Sync any pending workout data
    const pendingData = await getPendingData();
    if (pendingData.length > 0) {
      await syncPendingData(pendingData);
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Get pending data from IndexedDB
async function getPendingData() {
  // This would interact with IndexedDB to get pending sync data
  return [];
}

// Sync pending data to server
async function syncPendingData(data) {
  // This would send pending data to the server
  console.log('Syncing pending data:', data);
} 