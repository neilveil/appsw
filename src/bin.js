const main = require('./main').default

const appswRootArgIndex = process.argv.indexOf('--appsw-root')

const root = appswRootArgIndex > -1 ? process.argv[appswRootArgIndex + 1] : undefined

main(root, true)
