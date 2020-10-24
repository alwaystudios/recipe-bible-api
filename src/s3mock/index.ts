import express from 'express'
import fs from 'fs'
import path from 'path'

const PORT = 5001
const STORAGE_FOLDER = './storage'

if (!fs.existsSync(STORAGE_FOLDER)) {
  console.log('Creating storage folder')
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

console.log('Serving file from', STORAGE_FOLDER)
app.get('*', express.static(STORAGE_FOLDER))

app.put('*', (req, res) => {
  const fileName = `${STORAGE_FOLDER}${req.path}`
  console.log('Saving file', fileName)

  const dir = path.dirname(fileName)
  console.log('Using folder', dir)
  if (!fs.existsSync(dir)) {
    console.log('Creating folder', dir)
    fs.mkdirSync(dir)
  }

  fs.writeFile(fileName, req.body, (err) => {
    if (err) {
      console.log(err)
      return res.sendStatus(500)
    }
    console.log('File saved successfully')
    return res.send('<result>OK</result>')
  })
})

try {
  const server = app.listen(PORT, () => {
    console.log(`Started on port ${PORT}`)
  })
  server.once('error', (err) => {
    console.error(err)
  })
} catch (err) {
  console.error(err)
}
