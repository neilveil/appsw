window.addEventListener('load', async () => {
  // This API should never fail with working internet as SPA always have index.html as fallback
  // Simply return from here on error, that's why API call is out of try catch block
  // So removing apphash file from the application will not break the new application due to existing cache, as the cache will be removed automatically when JSON.parse will be called on plain html i.e. index.html
  const apphashFile = await (await fetch('/apphash.json?' + Date.now())).text()

  try {
    // If parse error, just reset
    const newHash = JSON.parse(apphashFile).hash

    const currentHash = window.localStorage.getItem('APPHASH')

    if (currentHash && newHash !== currentHash) throw new Error('Updating..')

    window.dispatchEvent(new Event('SW_READY'))

    window.navigator.serviceWorker
      .register('/service-worker.js')
      .then(() => window.localStorage.setItem('APPHASH', newHash))
  } catch (error) {
    console.log('server-worker-handler-error', error)

    await caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))))

    const registrations = await window.navigator.serviceWorker.getRegistrations()

    for (const registration of registrations) await registration.unregister()

    window.localStorage.removeItem('APPHASH')

    window.location.reload()
  }
})
