const debug = false
const isStatic = false

const print = (...content) => debug && console.log('APPSW ::', ...content)

const offlineHTML = '/offline.html'

self.addEventListener('install', event =>
  event.waitUntil(
    new Promise(async (resolve, reject) => {
      print('INSTALLING')

      // Drop existing cache
      await caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))))

      var precacheFiles = []

      if (isStatic) {
        try {
          const files = JSON.parse(await (await fetch('/apphash.json?' + Date.now())).text()).files
          if (files.length) precacheFiles = files
        } catch (error) {
          reject(error)
        }
      } else precacheFiles = [offlineHTML]

      // Cache all files
      await caches.open('STATIC').then(async cache => await cache.addAll(precacheFiles))

      print('SKIP_WAIT_TIME')
      await self.skipWaiting()

      print('INSTALLED')

      resolve(true)
    })
  )
)

self.addEventListener('activate', event =>
  event.waitUntil(
    new Promise(async resolve => {
      print('ACTIVATING')

      // Register self
      await self.clients.claim()
      print('CLAIMED_SELF')

      // Enable navigation preload
      self.registration.navigationPreload && (await self.registration.navigationPreload.enable())
      print('PRELOAD_ENABLED')

      print('ACTIVATED')

      resolve(true)
    })
  )
)

self.addEventListener('fetch', event =>
  event.respondWith(
    (async () => {
      print('FETCH ::', event.request)

      try {
        // Serve from cache if exists
        const cachedResponse = await caches.match(event.request)
        if (cachedResponse) {
          print('SERVED-FROM-CACHE ::', cachedResponse)
          return cachedResponse
        }

        // Use preload if possible
        const preloadResponse = await event.preloadResponse
        if (preloadResponse) {
          print('PRELOAD ::', preloadResponse)
          return preloadResponse
        }

        // Else go to network
        const networkResponse = await fetch(event.request).then(response => {
          // Cache response if matches an asset in the list
          if (['font', 'image', 'script', 'style'].includes(event.request.destination)) {
            let responseClone = response.clone()

            caches.open('RUNTIME').then(cache => cache.put(event.request, responseClone))

            print('CACHED ::', response)
          }

          print('SERVED-FROM-NETWORK ::', response)
          return response
        })

        return networkResponse
      } catch (error) {
        print('NETWORK-ERROR', event)

        if (event.request.mode === 'navigate' && !isStatic) {
          const cache = await caches.open('STATIC')
          const cachedResponse = await cache.match(offlineHTML)

          if (cachedResponse) {
            print('SERVED-OFFLINE-CONTENT ::', cachedResponse)
            return cachedResponse
          }
        }

        print('RESOURCE-NOT-FOUND', event)
        return new Response('Resource unavailable', { status: 503, statusText: 'Service Unavailable' })
      }
    })()
  )
)
