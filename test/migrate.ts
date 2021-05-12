/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires */

import { Pool } from 'pg'
import { createWriteStream } from 'fs'
import { pathOr } from 'ramda'
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
  const fat = pathOr(nutrition, ['fat'], nutrition)
  const carbs = pathOr(nutrition, ['carbs'], nutrition)
  const protein = pathOr(nutrition, ['protein'], nutrition)

  const focused = pathOr(false, ['focused'], metadata)
  const published = pathOr(false, ['published'], metadata)

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
