"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uglify_js_1 = require("uglify-js");
exports.default = ({ root = 'build', type = 'runtime', uncompressed = false, debug = false, cli = false }) => {
    root = path_1.default.resolve(root);
    if (cli) {
        console.log('APPSW_ROOT: ' + root);
        console.log('APPSW_TYPE: ' + type);
        if (uncompressed)
            console.log('APPSW_UNCOMPRESSED: True');
        if (debug)
            console.log('APPSW_DEBUG: True');
    }
    if (!fs_1.default.existsSync(root) || !fs_1.default.statSync(root).isDirectory())
        throw new Error(`"${root}" directory not found!`);
    const paths = {
        src: {
            sw: path_1.default.resolve(__dirname, '../scripts/service-worker.js'),
            swHandler: path_1.default.resolve(__dirname, '../scripts/service-worker-handler.js')
        },
        dest: {
            apphash: path_1.default.resolve(root, 'apphash.json'),
            sw: path_1.default.resolve(root, 'service-worker.js'),
            swHandler: path_1.default.resolve(root, 'service-worker-handler.js'),
            swAppend: path_1.default.resolve(root, 'service-worker-append.js')
        }
    };
    removeFileIfExists(paths.dest.apphash);
    removeFileIfExists(paths.dest.sw);
    removeFileIfExists(paths.dest.swHandler);
    let swContent = fs_1.default.readFileSync(paths.src.sw).toString();
    if (type === 'static')
        swContent = swContent.replace('const isStatic = false', 'const isStatic = true');
    if (debug)
        swContent = swContent.replace('const debug = false', 'const debug = true');
    fs_1.default.writeFileSync(paths.dest.sw, swContent);
    fs_1.default.copyFileSync(paths.src.swHandler, paths.dest.swHandler);
    if (fs_1.default.existsSync(paths.dest.swAppend) && fs_1.default.statSync(paths.dest.swAppend).isFile()) {
        const swAppendContent = '\n' + fs_1.default.readFileSync(paths.dest.swAppend).toString();
        fs_1.default.appendFileSync(paths.dest.sw, swAppendContent);
        console.log('APPSW_APPEND: ' + paths.dest.swAppend);
    }
    if (!uncompressed)
        for (const filePath of [paths.dest.sw, paths.dest.swHandler]) {
            const fileContent = fs_1.default.readFileSync(filePath).toString();
            const minifiedContent = (0, uglify_js_1.minify)(fileContent);
            if (minifiedContent.error)
                throw new Error(minifiedContent.error.message);
            fs_1.default.writeFileSync(filePath, minifiedContent.code);
        }
    var { hash, files, size } = dirinfo(root);
    let apphashContent = '';
    if (type === 'static')
        apphashContent = JSON.stringify({ hash, files, size });
    else
        apphashContent = JSON.stringify({ hash });
    fs_1.default.writeFileSync(paths.dest.apphash, apphashContent);
    if (cli)
        console.log('\n✅ Application service worker generated!');
};
const removeFileIfExists = (filePath) => filePath && fs_1.default.existsSync(filePath) && fs_1.default.rmSync(filePath);
const dirinfo = (dirPath) => {
    var size = 0;
    var hash = '';
    var files = [];
    if (!dirPath)
        throw new Error('Directory path required!');
    dirPath = path_1.default.resolve(dirPath);
    if (!fs_1.default.existsSync(dirPath) || !fs_1.default.statSync(dirPath).isDirectory()) {
        throw new Error(`Directory path not found: "${dirPath}"`);
    }
    const walk = (dirPath) => {
        const dirFiles = fs_1.default.readdirSync(dirPath);
        dirFiles.forEach((file) => {
            if (fs_1.default.statSync(dirPath + '/' + file).isDirectory())
                walk(dirPath + '/' + file);
            else {
                files.push(dirPath + '/' + file);
                const filePath = dirPath + '/' + file;
                size += fs_1.default.statSync(filePath).size;
                hash = crypto_1.default
                    .createHash('md5')
                    .update(hash + file + fs_1.default.readFileSync(filePath, 'base64'))
                    .digest('hex');
            }
        });
        return files;
    };
    walk(dirPath);
    files = files.map(file => file.slice(dirPath.length));
    return { files, size, hash, root: dirPath };
};
