"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRouter = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const pathParser_1 = require("../utils/pathParser");
const createRouter = (handlers) => {
    const executeHandler = async (event, awsRequestId) => {
        const { path, httpMethod, queryStringParameters, body, headers } = event;
        const { handlerName, subsegments } = pathParser_1.pathParser(path);
        const handler = handlers[handlerName];
        if (!handler) {
            throw http_errors_1.default(404);
        }
        return handler({
            httpMethod: httpMethod,
            subsegments,
            body,
            queryStringParameters,
            headers,
            awsRequestId,
        });
    };
    return {
        executeHandler,
    };
};
exports.createRouter = createRouter;
//# sourceMappingURL=routerFactory.js.map