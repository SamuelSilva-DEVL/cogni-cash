const CACHE_NAME = 'cogni-cash-v2'
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll([OFFLINE_URL, '/icons/icon-192.png', '/icons/icon-512.png']))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME)
        const offline = await cache.match(OFFLINE_URL)
        return offline || Response.error()
      }),
    )
    return
  }

  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/favicon.ico'

  if (!isStaticAsset) return

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request)
      const network = fetch(request)
        .then((response) => {
          const cacheControl = response.headers.get('cache-control') || ''
          const canCache =
            response.ok &&
            (url.pathname.startsWith('/icons/') ||
              url.pathname === '/favicon.ico' ||
              cacheControl.includes('immutable'))

          if (canCache) cache.put(request, response.clone())
          return response
        })
        .catch(() => cached ?? Response.error())

      return cached ?? network
    }),
  )
})
