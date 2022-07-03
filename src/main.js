const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const removeFileIfExists = filePath => filePath && fs.existsSync(filePath) && fs.rmSync(filePath)

const dirinfo = dirPath => {
  var size = 0
  var hash = ''
  var files = []

  if (!dirPath) throw new Error('Directory path required!')

  dirPath = path.resolve(dirPath)

  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    throw new Error(`Directory path not found: "${dirPath}"`)
  }

  const walk = dirPath => {
    const dirFiles = fs.readdirSync(dirPath)

    dirFiles.forEach(file => {
      if (fs.statSync(dirPath + '/' + file).isDirectory()) walk(dirPath + '/' + file)
      else {
        files.push(dirPath + '/' + file)

        const filePath = dirPath + '/' + file

        size += fs.statSync(filePath).size

        hash = crypto
          .createHash('md5')
          .update(hash + file + fs.readFileSync(filePath, 'base64'))
          .digest('hex')
      }
    })

    return files
  }

  walk(dirPath, false)

  files = files.map(file => file.slice(dirPath.length))

  return { files, size, hash, root: dirPath }
}

const main = (root = 'build', cli = false) => {
  root = path.resolve(root)

  if (cli) console.log('ROOT: ' + root)

  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new Error('Root directory not found!')

  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new Error(`"${root}" directory not found!`)

  const paths = {
    apphash: root + '/apphash.json',
    sw: root + '/service-worker.js',
    swHandler: root + '/service-worker-handler.js',
    swAppend: root + '/service-worker-append.js',
    swOverwrite: root + '/service-worker-overwrite.js'
  }

  removeFileIfExists(paths.apphash)
  removeFileIfExists(paths.sw)
  removeFileIfExists(paths.swHandler)

  var { hash, files } = dirinfo(root)

  fs.writeFileSync(paths.apphash, JSON.stringify({ hash, files }))

  fs.copyFileSync(__dirname + '/service-worker.js', paths.sw)
  fs.copyFileSync(__dirname + '/service-worker-handler.js', paths.swHandler)

  if (fs.existsSync(paths.swOverwrite) && fs.statSync(paths.swOverwrite).isFile())
    fs.copyFileSync(paths.swOverwrite, paths.sw)

  if (fs.existsSync(paths.swAppend) && fs.statSync(paths.swAppend).isFile()) {
    const swAppendContent = '\n' + fs.readFileSync(paths.swAppend).toString()
    fs.appendFileSync(paths.sw, swAppendContent)
  }

  if (cli) console.log('Application service worker generated!')
}

module.exports.default = main
