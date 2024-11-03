# AppSW - Application Service Worker

Simple browser file caching implementation to give your website/application wings.

## Installation

```
npm install appsw
```

## Setup build command

Append `appsw` command after the default build command.

```json
{
  "scripts": {
    "build": "my-build-command && appsw"
  }
}
```

## Configuration

| Argument       | Type   | Default | Usage                                |
| -------------- | ------ | ------- | ------------------------------------ |
| --appsw-root   | String | build   | Build directory path                 |
| --type         | String | runtime | `static` or `runtime`                |
| --uncompressed |        | false   | Output uncompressed scripts          |
| --debug        |        | false   | Add debugging logs in output scripts |

Example

```sh
appsw --appsw-root ./example --type runtime --uncompressed --debug
```

## Add handler script in `index.html`

```html
<body>
  ...

  <script src="/service-worker-handler.js"></script>
</body>
```

> An empty js file `service-worker-handler.js` can be kept to avoid unwanted 404 error in dev mode.

## Ready event

When the application updates its cache, a page reload may be required to use the latest files, which can cause a brief interruption for the user because of reload. To prevent this, the application should wait for the `SW_READY` event.

```js
window.addEventListener('APPSW_READY', () => {
  console.log('AppSW ready!')
})
```

> Only occurs when new version of the application is deployed.

## `runtime` vs `static`

- Apps which can work without internet should use `static` cache else `runtime` cache.
- Runtime cache app should have offline html file `offline.html` which will be visible when there is not internet connection.

## Append content in default service worker

Add `service-worker-append.js` file which will automatically append content in default service worker.

## Migration from AppSW

To stop using `appsw`, first remove `appsw` command from build script.

To disable `appsw` service worker, update `apphash.json` as:

```json
{ "disable": true }
```

To completely remove service worker from your application, update `apphash.json` as:

```json
{ "unregister": true }
```

## Files

- `apphash.json` **auto-generated**: Keeps a track of cached files.
- `service-worker.js` **auto-generated**: Main service worker file.
- `service-worker-handler.js` **auto-generated**: Setup service worker, responsible for cache rotation & ready event.
- `service-worker-append.js`: Contains custom code to be appended in the main service worker file.

## Note

- Avoid using `Cache-Control` header from your server to cache files.
- When updating or removing appsw, ensure `apphash.json` is updated accordingly; refer to the migration docs above.
- Waiting for `APPSW_READY` event is recommended for smooth user experience.
