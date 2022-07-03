const main = require('./main').default

const root = process.argv[process.argv.indexOf('--appsw-root') + 1]

main(root, true)
