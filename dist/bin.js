"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs/yargs"));
const helpers_1 = require("yargs/helpers");
const index_1 = __importDefault(require("./index"));
const argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv)).argv;
(0, index_1.default)({
    root: argv['appsw-root'],
    type: argv['type'],
    debug: argv['debug'],
    uncompressed: argv['uncompressed'],
    cli: true
});
