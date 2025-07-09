// Study Vibes Radio - Service Worker
// Provides offline functionality and caching for PWA

const CACHE_NAME = 'study-vibes-radio-v1';
const STATIC_CACHE_NAME = 'study-vibes-static-v1';
const DYNAMIC_CACHE_NAME = 'study-vibes-dynamic-v1';

// Files to cache immediately (app shell)
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/src/styles.css',
    '/src/main.js',
    '/src/player.js',
    '/src/vibes.js',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap',
    'https://www.youtube.com/iframe_api'
];

// Files to cache dynamically (user-generated content)
const DYNAMIC_ASSETS = [
    '/public/bg/',
    '/public/icon-'
];

// Network-first resources (always try network first)
const NETWORK_FIRST = [
    'https://www.youtube.com/iframe_api',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Failed to cache static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE_NAME && 
                            cacheName !== DYNAMIC_CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip YouTube API requests (they need to be fresh)
    if (url.hostname === 'www.youtube.com' && url.pathname.includes('iframe_api')) {
        event.respondWith(
            fetch(request)
                .catch(() => {
                    // Fallback for offline YouTube API
                    return new Response('console.log("YouTube API unavailable offline");', {
                        headers: { 'Content-Type': 'application/javascript' }
                    });
                })
        );
        return;
    }
    
    // Network first for external resources
    if (NETWORK_FIRST.some(pattern => request.url.includes(pattern))) {
        event.respondWith(networkFirst(request));
        return;
    }
    
    // Cache first for static assets
    if (STATIC_ASSETS.some(asset => request.url.includes(asset))) {
        event.respondWith(cacheFirst(request));
        return;
    }
    
    // Stale while revalidate for dynamic content
    event.respondWith(staleWhileRevalidate(request));
});

// Cache-first strategy
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Cache-first strategy failed:', error);
        
        // Return offline fallback for HTML requests
        if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/');
        }
        
        throw error;
    }
}

// Network-first strategy
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', request.url);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Always try to fetch fresh content in background
    const fetchPromise = fetch(request)
        .then((networkResponse) => {
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch((error) => {
            console.log('Network request failed:', error);
            return cachedResponse;
        });
    
    // Return cached content immediately if available
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Otherwise wait for network
    return fetchPromise;
}

// Handle background sync (for future features)
self.addEventListener('sync', (event) => {
    console.log('Background sync:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Placeholder for background sync functionality
    console.log('Performing background sync...');
}

// Handle push notifications (for future features)
self.addEventListener('push', (event) => {
    console.log('Push notification received:', event);
    
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.body || 'New notification from Study Vibes Radio',
            icon: '/public/icon-192.png',
            badge: '/public/icon-72.png',
            vibrate: [200, 100, 200],
            data: data.data || {},
            actions: [
                {
                    action: 'open',
                    title: 'Open App',
                    icon: '/public/icon-72.png'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss',
                    icon: '/public/icon-72.png'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'Study Vibes Radio', options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);
    
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
    console.log('Service Worker received message:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                    return cache.addAll(event.data.urls);
                })
        );
    }
});

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker unhandled rejection:', event.reason);
    event.preventDefault();
});

// Utility function to check if request should be cached
function shouldCache(request) {
    const url = new URL(request.url);
    
    // Don't cache YouTube video content
    if (url.hostname.includes('youtube') && !url.pathname.includes('iframe_api')) {
        return false;
    }
    
    // Don't cache external analytics or tracking
    if (url.hostname.includes('google-analytics') || 
        url.hostname.includes('googletagmanager')) {
        return false;
    }
    
    return true;
}

// Cleanup old caches periodically
async function cleanupCaches() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
        name !== STATIC_CACHE_NAME && name !== DYNAMIC_CACHE_NAME
    );
    
    return Promise.all(
        oldCaches.map(cacheName => caches.delete(cacheName))
    );
}

// Run cleanup on activation
self.addEventListener('activate', (event) => {
    event.waitUntil(cleanupCaches());
});

console.log('Study Vibes Radio Service Worker loaded'); 