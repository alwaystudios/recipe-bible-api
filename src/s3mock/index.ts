import express from 'express'
import fs from 'fs'
import path from 'path'
import { log } from '../infra/logger'

const PORT = 5001
const STORAGE_FOLDER = './storage'

if (!fs.existsSync(STORAGE_FOLDER)) {
  log.info('Creating storage folder')
  fs.mkdirSync(STORAGE_FOLDER)
}

const app = express()

app.use(
  express.raw({
    inflate: true,
    limit: '10000kb',
    type: '*/*',
  }),
)

log.info('Serving file from', STORAGE_FOLDER)
app.get('*', express.static(STORAGE_FOLDER))

app.put('*', (req, res) => {
  const fileName = `${STORAGE_FOLDER}${req.path}`
  log.info('Saving file', fileName)

  const dir = path.dirname(fileName)
  log.info('Using folder', dir)
  if (!fs.existsSync(dir)) {
    log.info('Creating folder', dir)
    fs.mkdirSync(dir)
  }

  fs.writeFile(fileName, req.body, (err) => {
    if (err) {
      log.info(err)
      return res.sendStatus(500)
    }
    log.info('File saved successfully')
    return res.send('<result>OK</result>')
  })
})

try {
  const server = app.listen(PORT, () => {
    log.info(`Started on port ${PORT}`)
  })
  server.once('error', (err) => {
    log.error(err)
  })
} catch (err) {
  log.error(err)
}
