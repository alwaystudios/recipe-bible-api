"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recipeHandler = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const recipeService_1 = require("../domain/recipeService");
const recipeHandler = async ({ httpMethod }) => {
    switch (httpMethod) {
        case 'GET':
            const data = await recipeService_1.getRecipes();
            return {
                statusCode: 200,
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    status: 'ok',
                    data,
                }),
            };
    }
    throw http_errors_1.default(404);
};
exports.recipeHandler = recipeHandler;
//# sourceMappingURL=recipeHandler.js.map