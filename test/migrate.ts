/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires */

import { Pool } from 'pg'
import { DDB_TABLE_NAME } from '../src/constants'
import { testDynamoClient } from './acceptance/awsTestClients'
import _ from 'lodash'
const { host, password } = require('../secrets.json')

const params = {
	recipes: true,
	ingredients: true,
}

const pool = new Pool({
	min: 10,
	max: 20,
	host,
	password,
	database: 'recipebible',
	user: 'postgres',
	idleTimeoutMillis: 60000,
	connectionTimeoutMillis: 60000,
	statement_timeout: 60 * 60 * 1000,
})
pool.on('error', (error: Error) => {
	console.error('PG error', error)
})

const migrateRecipe = async ({
	title,
	details: { steps, story, imgSrc, metadata, servings, nutrition, categories, cookingTime, ingredients, ratings },
}: any) => {
	const fat = _.get(nutrition, ['fat'], undefined)
	const carbs = _.get(nutrition, ['carbs'], undefined)
	const protein = _.get(nutrition, ['protein'], undefined)

	await testDynamoClient.putItem(
		{
			pk: 'recipe',
			sk: title,
			metadata,
			imgSrc,
			story,
			steps,
			ingredients,
			servings,
			nutrition: { fat, carbs, protein },
			categories,
			cookingTime,
			prepTime: '',
			youWillNeed: [],
			ratings,
		},
		DDB_TABLE_NAME,
	)
}

const migrateIngredient = async ({ title }: any) => {
	await testDynamoClient.putItem(
		{
			pk: 'ingredient',
			sk: title,
		},
		DDB_TABLE_NAME,
	)
}

const migrate = async () => {
	await testDynamoClient.truncateTable(DDB_TABLE_NAME, 'pk', 'sk')

	if (params.recipes) {
		console.log('migrate recipes')
		await pool.query('select * from recipe').then((res) => Promise.all(res.rows.map(migrateRecipe)))
	}

	if (params.ingredients) {
		console.log('migrate ingredients')
		await pool.query('select * from ingredient').then((res) => Promise.all(res.rows.map(migrateIngredient)))
	}
}

migrate()
	.then(() => {
		process.exit(0)
	})
	.catch((err) => {
		console.log(err)
	})
