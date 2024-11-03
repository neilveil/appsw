import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { minify } from 'uglify-js'

type args = {
  root: string
  type: 'static' | 'runtime'
  uncompressed: boolean
  debug: boolean
  cli: boolean
}

export default ({ root = 'build', type = 'runtime', uncompressed = false, debug = false, cli = false }: args) => {
  root = path.resolve(root)

  if (cli) {
    console.log('APPSW_ROOT: ' + root)
    console.log('APPSW_TYPE: ' + type)

    if (uncompressed) console.log('APPSW_UNCOMPRESSED: True')
    if (debug) console.log('APPSW_DEBUG: True')
  }

  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new Error(`"${root}" directory not found!`)

  const paths = {
    src: {
      sw: path.resolve('./scripts/service-worker.js'),
      swHandler: path.resolve('./scripts/service-worker-handler.js')
    },
    dest: {
      apphash: path.resolve(root, 'apphash.json'),
      sw: path.resolve(root, 'service-worker.js'),
      swHandler: path.resolve(root, 'service-worker-handler.js'),
      swAppend: path.resolve(root, 'service-worker-append.js')
    }
  }

  // Remove existing files
  removeFileIfExists(paths.dest.apphash)
  removeFileIfExists(paths.dest.sw)
  removeFileIfExists(paths.dest.swHandler)

  let swContent: string = fs.readFileSync(paths.src.sw).toString()

  // If static
  if (type === 'static') swContent = swContent.replace('const isStatic = false', 'const isStatic = true')
  // If debug
  if (debug) swContent = swContent.replace('const debug = false', 'const debug = true')

  fs.writeFileSync(paths.dest.sw, swContent)

  // Service worker handle setup
  fs.copyFileSync(paths.src.swHandler, paths.dest.swHandler)

  // Service worker append file setup
  if (fs.existsSync(paths.dest.swAppend) && fs.statSync(paths.dest.swAppend).isFile()) {
    const swAppendContent = '\n' + fs.readFileSync(paths.dest.swAppend).toString()
    fs.appendFileSync(paths.dest.sw, swAppendContent)
    console.log('APPSW_APPEND: ' + paths.dest.swAppend)
  }

  if (!uncompressed)
    for (const filePath of [paths.dest.sw, paths.dest.swHandler]) {
      const fileContent = fs.readFileSync(filePath).toString()

      const minifiedContent = minify(fileContent)
      if (minifiedContent.error) throw new Error(minifiedContent.error.message)

      fs.writeFileSync(filePath, minifiedContent.code)
    }

  // App hash setup
  var { hash, files, size } = dirinfo(root)

  let apphashContent = ''
  if (type === 'static') apphashContent = JSON.stringify({ hash, files, size })
  else apphashContent = JSON.stringify({ hash })

  fs.writeFileSync(paths.dest.apphash, apphashContent)

  if (cli) console.log('\n✅ Application service worker generated!')
}

const removeFileIfExists = (filePath: string) => filePath && fs.existsSync(filePath) && fs.rmSync(filePath)

const dirinfo = (dirPath: string) => {
  var size = 0
  var hash = ''
  var files: string[] = []

  if (!dirPath) throw new Error('Directory path required!')

  dirPath = path.resolve(dirPath)

  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    throw new Error(`Directory path not found: "${dirPath}"`)
  }

  const walk = (dirPath: string) => {
    const dirFiles = fs.readdirSync(dirPath)

    dirFiles.forEach((file: string) => {
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

  walk(dirPath)

  files = files.map(file => file.slice(dirPath.length))

  return { files, size, hash, root: dirPath }
}
