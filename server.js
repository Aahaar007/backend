const express = require('express')
const mongoose = require('mongoose')
const logger = require('morgan')

const CONFIG = require('./config/config')
const routes = require('./routes')

const mongoURI =
  CONFIG.DB_USERNAME && CONFIG.DB_PASSWORD
    ? `mongodb+srv://${CONFIG.DB_USERNAME}:${CONFIG.DB_PASSWORD}@${CONFIG.DB_URL}/${CONFIG.DB_NAME}`
    : `mongodb://localhost/${CONFIG.DB_NAME}`

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    if (CONFIG.NODE_ENV == 'development')
      console.log(`Connected to mongodb url: ${mongoURI}`)
  })
  .catch((e) =>
    console.log(`Error connecting to mongo url ${mongoURI} :  ${e.message}`)
  )

const app = express()
app.use(express.json())

if (CONFIG.NODE_ENV == 'development') {
  app.use(logger('dev'))
}

app.get('/health', async (req, res) => {
  res.status(200).send({
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
  })
})

app.use('/services', routes)

app.listen(CONFIG.PORT, () => {
  console.log(`Express server up on port ${CONFIG.PORT}`)
})
