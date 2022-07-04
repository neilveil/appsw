# App SW

## Installation

```
npm install appsw
```

## Usage

### CLI

```sh
npx appsw
npx appsw --appsw-root ./my-build"
```

### Module

```js
const appsw = require('appsw')

appsw()
appsw('./my-build')
```

### Package JSON

```json
{
  "scripts": {
    "test-cli": "appsw",
    "test-cli": "appsw --appsw-root ./my-build"
  }
}
```

> Default value of "--appsw-root" is "build".

## Integration

```html
<body>
  ...

  <script src="/service-worker-handler.js"></script>
</body>
```

## Customization

### Append content in default service worker

`service-worker-append.js` file appends content in default service worker.

### Overwrite default service worker

`service-worker-overwrite.js` overwrites content in default service worker.

> Avoid using "Cache-Control" headers to cache the latest files on apphash update.
