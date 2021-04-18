"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDynamoClient = void 0;
const dynamoClient_1 = require("./dynamoClient");
const dynamoInstance = Object.freeze(dynamoClient_1.createDynamoClient());
const getDynamoClient = () => dynamoInstance;
exports.getDynamoClient = getDynamoClient;
//# sourceMappingURL=getClients.js.map