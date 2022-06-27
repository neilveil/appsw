self.print = (...content) => false && console.log(...content)

self.addEventListener('install', event =>
  event.waitUntil(
    new Promise(async (resolve, reject) => {
      print('Installing..')

      // Drop existing cache
      await caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))))

      var precacheFiles
      try {
        precacheFiles = JSON.parse(await (await fetch('/apphash.json?' + Date.now())).text()).files
      } catch (error) {
        reject(error)
      }

      // Cache all files
      await caches.open('STATIC').then(async cache => await cache.addAll(precacheFiles))

      print('Skipping wait time..')
      await self.skipWaiting()

      print('Installed!')

      resolve()
    })
  )
)

self.addEventListener('activate', event =>
  event.waitUntil(
    new Promise(async resolve => {
      print('Activating..')

      // Register self
      await self.clients.claim()
      print('Claimed self!')

      // Enable navigation preload
      self.registration.navigationPreload && (await self.registration.navigationPreload.enable())
      print('Preload enabled!')

      print('Activated!')

      resolve()
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
        print('NETWORK-ERROR')

        const cache = await caches.open('STATIC')
        const cachedResponse = await cache.match('offline.html')

        print('SERVED-OFFLINE-CONTENT ::', cachedResponse)
        return cachedResponse
      }
    })()
  )
)
