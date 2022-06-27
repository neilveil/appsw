# App SW

## Installation

```
npm install appsw
```

## Usage

### CLI

```
npx appsw --appsw-root build
```

### Module

```js
const appsw = require('appsw')

appsw('build')
```

### PackageJSON

```json
{
  "scripts": {
    "test-cli": "appsw --appsw-root build"
  }
}
```

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
