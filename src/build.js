const webpack = require('webpack')
const obfuscator = require('webpack-obfuscator')

const obfuscatorPlugin = new obfuscator({ rotateStringArray: true })

const commonConfig = {
  output: {
    filename: '[name].js',
    path: __dirname + '/../' + '/build'
  },
  mode: 'production'
}

webpack(
  {
    entry: {
      index: __dirname + '/index.js'
    },
    target: 'node',
    plugins: [
      new webpack.BannerPlugin({
        banner: '#!/usr/bin/env node',
        raw: true
      }),
      obfuscatorPlugin
    ],
    ...commonConfig
  },
  error => {
    if (error) return console.error('Build error: ', error)

    webpack(
      {
        entry: {
          'service-worker': __dirname + '/service-worker.js',
          'service-worker-handler': __dirname + '/service-worker-handler.js'
        },
        plugins: [obfuscatorPlugin],
        ...commonConfig
      },
      error => error && console.error('Build error: ', error)
    )
  }
)
