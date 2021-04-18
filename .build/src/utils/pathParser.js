"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathParser = void 0;
const truthy_1 = require("./truthy");
const lodash_1 = __importDefault(require("lodash"));
const pathParser = (path) => {
    const segments = path.split('/').filter(truthy_1.truthy);
    const versionIndex = segments.indexOf('v1');
    const handlerName = lodash_1.default.get(segments, [versionIndex + 1], '');
    const subsegments = lodash_1.default.slice(segments, versionIndex + 2);
    return {
        handlerName,
        subsegments,
    };
};
exports.pathParser = pathParser;
//# sourceMappingURL=pathParser.js.map