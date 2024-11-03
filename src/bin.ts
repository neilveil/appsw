#!/usr/bin/env node

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import main from './index'

const argv: any = yargs(hideBin(process.argv)).argv

main({
  root: argv['appsw-root'],
  type: argv['type'],
  debug: argv['debug'],
  uncompressed: argv['uncompressed'],
  cli: true
})
