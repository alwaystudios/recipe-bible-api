"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpErrorHandler = void 0;
const lodash_1 = __importDefault(require("lodash"));
const httpErrorHandler = () => {
    return {
        onError: (handler, next) => {
            const { error } = handler;
            const statusCode = lodash_1.default.get(error, ['statusCode'], 500);
            let errors = [{ message: 'Something went wrong' }];
            if (statusCode < 500) {
                errors = Array.isArray(error) ? error : [error];
            }
            Object.assign(handler, {
                response: {
                    statusCode,
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ status: 'error', errors }),
                },
            });
            return next();
        },
    };
};
exports.httpErrorHandler = httpErrorHandler;
//# sourceMappingURL=httpErrorHandler.js.map