// Study Vibes Radio - Service Worker
// Provides offline functionality and caching for PWA

const CACHE_NAME = 'study-vibes-radio-v1';
const STATIC_CACHE_NAME = 'study-vibes-static-v1';
const DYNAMIC_CACHE_NAME = 'study-vibes-dynamic-v1';

// Files to cache immediately (app shell) - only existing files
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/src/styles.css',
    '/src/main.js',
    '/src/player.js',
    '/src/vibes.js',
    '/manifest.json'
];

// External resources to cache
const EXTERNAL_ASSETS = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap',
    'https://www.youtube.com/iframe_api'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets');
                // Cache static assets, but don't fail if some are missing
                return Promise.allSettled([
                    cache.addAll(STATIC_ASSETS),
                    cache.addAll(EXTERNAL_ASSETS)
                ]);
            })
            .then(() => {
                console.log('Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Failed to cache some assets:', error);
                // Don't fail the install, just log the error
                return self.skipWaiting();
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
    
    // Skip chrome-extension requests
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // Handle missing assets gracefully
    if (url.pathname.includes('/public/bg/') || url.pathname.includes('/public/icon-')) {
        event.respondWith(
            fetch(request)
                .catch(() => {
                    // Return a transparent 1x1 pixel for missing images/videos
                    if (url.pathname.includes('.png') || url.pathname.includes('.jpg')) {
                        return new Response(
                            'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
                            { headers: { 'Content-Type': 'image/gif' } }
                        );
                    }
                    // For videos, return a minimal response
                    if (url.pathname.includes('.mp4')) {
                        return new Response('', { status: 404 });
                    }
                    return new Response('Not found', { status: 404 });
                })
        );
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
    if (url.hostname.includes('fonts.googleapis.com') || 
        url.hostname.includes('fonts.gstatic.com')) {
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

// Handle messages from main thread
self.addEventListener('message', (event) => {
    console.log('Service Worker received message:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
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

console.log('Study Vibes Radio Service Worker loaded'); 