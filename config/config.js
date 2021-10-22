require('dotenv').config()

const CONFIG = {}

const requiredDefaults = {
  PORT: 3000,
  DB_NAME: 'aahaar',
  NODE_ENV: 'development',
}

const nonRequiredDefaults = {
  DB_URL: 'localhost',
  DB_USERNAME: '',
  DB_PASSWORD: '',
}

const requiredVars = Object.keys(requiredDefaults)

requiredVars.forEach((val) => {
  if (!requiredDefaults[val] && !process.env[val])
    throw new Error(`Fatal Error. ${val} not defined.`)
  CONFIG[val] = process.env[val] || requiredDefaults[val]
})

const nonRequiredVars = Object.keys(nonRequiredDefaults)

nonRequiredVars.forEach((val) => {
  CONFIG[val] = process.env[val] || nonRequiredDefaults[val]
})

module.exports = CONFIG
