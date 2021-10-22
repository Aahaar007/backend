//import the controller defined in ../controller and use it here
//then export the router.
const router = require('express').Router()

const controller = require('../controllers/example.controller')

router.get('/example', controller.read)

module.exports = router
