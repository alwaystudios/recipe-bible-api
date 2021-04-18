"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDynamoClient = void 0;
const dynamodb_1 = require("aws-sdk/clients/dynamodb");
const createDynamoClient = (client = new dynamodb_1.DocumentClient()) => {
    const updateItem = async (params) => client.update(params).promise();
    const putItem = async (item, table) => {
        return new Promise((resolve, reject) => {
            client.put({
                TableName: table,
                Item: item,
            }, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    };
    const getItem = async (params) => {
        return new Promise((resolve, reject) => {
            client.get(params, (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    };
    const deleteItem = async (params) => {
        return new Promise((resolve, reject) => {
            client.delete(params, (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    };
    const query = async (params) => {
        return new Promise((resolve, reject) => {
            client.query(params, (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    };
    const getItemKeyAndValue = (item, key) => (key ? { [`${key}`]: item[`${key}`] } : {});
    const truncateTable = async (TableName, hash, range) => {
        const { Items } = await client.scan({ TableName }).promise();
        if (!Items) {
            return;
        }
        const keys = Items.map((item) => ({
            ...getItemKeyAndValue(item, hash),
            ...getItemKeyAndValue(item, range),
        }));
        if (!keys.length) {
            return;
        }
        await Promise.all(keys === null || keys === void 0 ? void 0 : keys.map((Key) => deleteItem({ TableName, Key })));
    };
    return {
        putItem,
        updateItem,
        deleteItem,
        getItem,
        query,
        truncateTable,
    };
};
exports.createDynamoClient = createDynamoClient;
//# sourceMappingURL=dynamoClient.js.map