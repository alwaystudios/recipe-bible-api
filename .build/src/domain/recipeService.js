"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecipes = exports.saveRecipe = exports.saveRecipeMetadata = void 0;
const constants_1 = require("../constants");
const getClients_1 = require("../clients/getClients");
const lodash_1 = __importDefault(require("lodash"));
const saveRecipeMetadata = async (title, metadata) => {
    await getClients_1.getDynamoClient().updateItem({
        TableName: constants_1.DDB_TABLE_NAME,
        Key: {
            pk: 'reipce',
            sk: title,
        },
        UpdateExpression: 'set metadata = :metadata',
        ExpressionAttributeValues: {
            ':metadata': metadata,
        },
    });
};
exports.saveRecipeMetadata = saveRecipeMetadata;
const saveRecipe = async ({ title, steps, story, imgSrc, metadata, servings, nutrition, categories, cookingTime, prepTime, youWillNeed, ingredients, ratings, }) => getClients_1.getDynamoClient().putItem({
    pk: 'recipe',
    sk: title,
    metadata,
    imgSrc,
    story,
    steps,
    ingredients,
    servings,
    nutrition,
    categories,
    cookingTime,
    prepTime,
    youWillNeed,
    ratings,
}, constants_1.DDB_TABLE_NAME);
exports.saveRecipe = saveRecipe;
const fromRecipesQuery = (res) => {
    const recipes = lodash_1.default.get(res, ['Items'], []);
    return recipes.map(({ title, steps, story, imgSrc, metadata, servings, nutrition, categories, cookingTime, prepTime, youWillNeed, ingredients, ratings, }) => ({
        title,
        steps,
        story,
        imgSrc,
        metadata,
        servings,
        nutrition,
        categories,
        cookingTime,
        prepTime,
        youWillNeed,
        ingredients,
        ratings,
    }));
};
const getRecipes = async () => getClients_1.getDynamoClient()
    .query({
    TableName: constants_1.DDB_TABLE_NAME,
    KeyConditionExpression: '#pk = :pk',
    ExpressionAttributeNames: {
        '#pk': 'pk',
    },
    ExpressionAttributeValues: {
        ':pk': 'recipe',
    },
})
    .then((res) => fromRecipesQuery(res));
exports.getRecipes = getRecipes;
//# sourceMappingURL=recipeService.js.map