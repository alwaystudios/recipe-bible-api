"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.endpoint = void 0;
const core_1 = __importDefault(require("@middy/core"));
const httpErrorHandler_1 = require("../middleware/httpErrorHandler");
const routerFactory_1 = require("./routerFactory");
const recipeHandler_1 = require("./recipeHandler");
const handler = async (event, { awsRequestId }) => routerFactory_1.createRouter({ recipe: recipeHandler_1.recipeHandler }).executeHandler(event, awsRequestId);
exports.endpoint = core_1.default(handler).use(httpErrorHandler_1.httpErrorHandler());
//# sourceMappingURL=router.js.map