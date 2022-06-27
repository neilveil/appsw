const webpack = require('webpack')
const obfuscator = require('webpack-obfuscator')

webpack(
  {
    entry: {
      index: __dirname + '/index.js'
    },
    output: {
      filename: '[name].js',
      path: __dirname + '/../' + '/build',
      library: {
        type: 'umd',
        export: 'default'
      }
    },
    mode: 'production',
    target: 'node',
    plugins: [
      new webpack.BannerPlugin({
        banner: '#!/usr/bin/env node',
        raw: true
      }),
      new obfuscator({ rotateStringArray: true })
    ]
  },
  error => {
    if (error) return console.error('Build error: ', error)

    webpack(
      {
        entry: {
          'service-worker': __dirname + '/service-worker.js',
          'service-worker-handler': __dirname + '/service-worker-handler.js'
        },
        output: {
          filename: '[name].js',
          path: __dirname + '/../' + '/build'
        },
        mode: 'production',
        plugins: [new obfuscator({ rotateStringArray: true })]
      },
      error => error && console.error('Build error: ', error)
    )
  }
)
