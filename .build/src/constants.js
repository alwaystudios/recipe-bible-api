"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DDB_TABLE_NAME = exports.AUTH_SERVICE_URL = exports.BASE_URL = exports.ENV_AUTH_SERVICE_BASE_URL = exports.ENV_TABLE_NAME = exports.ENV_RECIPE_API_BASE_URL = exports.IS_OFFLINE = void 0;
_a = process.env, exports.IS_OFFLINE = _a.IS_OFFLINE, exports.ENV_RECIPE_API_BASE_URL = _a.ENV_RECIPE_API_BASE_URL, exports.ENV_TABLE_NAME = _a.ENV_TABLE_NAME, exports.ENV_AUTH_SERVICE_BASE_URL = _a.ENV_AUTH_SERVICE_BASE_URL;
exports.BASE_URL = 'http://localhost:21111';
exports.AUTH_SERVICE_URL = exports.ENV_AUTH_SERVICE_BASE_URL || 'http://todo';
exports.DDB_TABLE_NAME = exports.ENV_TABLE_NAME || 'ddb-local-recipe-bible';
//# sourceMappingURL=constants.js.map