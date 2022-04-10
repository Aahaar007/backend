const express = require('express')
const mongoose = require('mongoose')
const logger = require('morgan')
const cors = require('cors')
const admin = require('firebase-admin')

const CONFIG = require('./config/config')
const routes = require('./routes')

const firebaseServiceAccount = {
  type: CONFIG.FIREBASE_ACCOUNT_TYPE,
  project_id: CONFIG.FIREBASE_PROJECT_ID,
  private_key_id: CONFIG.FIREBASE_PRIVATE_KEY_ID,
  private_key: CONFIG.FIREBASE_PRIVATE_KEY,
  client_email: CONFIG.FIREBASE_CLIENT_EMAIL,
  client_id: CONFIG.FIREBASE_CLIENT_ID,
  auth_uri: CONFIG.FIREBASE_AUTH_URI,
  token_uri: CONFIG.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: CONFIG.FIREBASE_AUTH_PROVIDER_x509_CERT_URL,
  client_x509_cert_url: CONFIG.FIREBASE_CLIENT_x509_CERT_URL,
}

const mongoURI =
  CONFIG.DB_USERNAME && CONFIG.DB_PASSWORD
    ? `mongodb+srv://${CONFIG.DB_USERNAME}:${CONFIG.DB_PASSWORD}@${CONFIG.DB_URL}/${CONFIG.DB_NAME}`
    : `mongodb://localhost/${CONFIG.DB_NAME}?replicaSet=${CONFIG.DB_REPLICA_SET_NAME}`

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Connected to ${CONFIG.DB_NAME} mongodb database.`)
  })
  .catch((e) => console.log(`Error connecting to mongo url : ${e.message}`))

admin.initializeApp({
  credential: admin.credential.cert(firebaseServiceAccount),
})

const app = express()
app.use(express.json())
app.use(express.static('public'))
app.use(cors())

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
  console.log(`Express server up on port ${CONFIG.PORT}.`)
})
