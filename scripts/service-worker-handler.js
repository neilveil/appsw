window.addEventListener('load', async () => {
  try {
    const apphashFile = await (await fetch('/apphash.json?' + Date.now())).text()

    const apphashJSON = JSON.parse(apphashFile)

    const newHash = apphashJSON.hash
    const disabale = apphashJSON.disabale
    const unregister = apphashJSON.unregister

    if (disabale) return
    if (unregister) return window.unregisterServiceWorker()

    const currentHash = window.localStorage.getItem('APPHASH')
    if (currentHash && newHash !== currentHash) return window.unregisterServiceWorker()

    window.dispatchEvent(new Event('APPSW_READY'))

    window.navigator.serviceWorker
      .register('/service-worker.js')
      .then(() => window.localStorage.setItem('APPHASH', newHash))
  } catch (error) {
    console.log('server-worker-handler-error', error)
  }
})

window.unregisterServiceWorker = async () => {
  await caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))))
  const registrations = await window.navigator.serviceWorker.getRegistrations()
  for (const registration of registrations) await registration.unregister()
  window.localStorage.removeItem('APPHASH')
  window.location.reload()
}
