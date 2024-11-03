"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_tools_1 = __importDefault(require("express-tools"));
const path_1 = __importDefault(require("path"));
const app = (0, express_tools_1.default)();
app.use('*', (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname + '../../example/index.html'));
});
