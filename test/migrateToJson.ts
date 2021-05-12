/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires */

import { Pool } from 'pg'
import _ from 'lodash'
import { createWriteStream } from 'fs'
const { host, password } = require('../secrets.json')

const writeStream = createWriteStream('./recipe-bible-export.json')

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

const migrateRecipe = ({
  title,
  details: {
    steps,
    story,
    imgSrc,
    metadata,
    servings,
    nutrition,
    categories,
    cookingTime,
    ingredients,
    ratings,
  },
}: any) => {
  const fat = _.get(nutrition, ['fat'], undefined)
  const carbs = _.get(nutrition, ['carbs'], undefined)
  const protein = _.get(nutrition, ['protein'], undefined)

  const focused = _.get(metadata, ['focused'], false)
  const published = _.get(metadata, ['published'], false)

  return {
    title,
    metadata: { focused, published },
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
  }
}

const migrate = async () => {
  const recipes = await pool
    .query('select * from recipe')
    .then((res) => res.rows.map(migrateRecipe))
  const ingredients = await pool
    .query('select * from ingredient')
    .then((res) => res.rows.map(({ title }) => title))

  writeStream.write(JSON.stringify({ ingredients, recipes }))
  writeStream.end()
}

migrate()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.log(err)
  })
