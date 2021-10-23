//import the controller defined in ../controller and use it here
//then export the router.
const router = require('express').Router()

const auth = require('../middlewares/auth.middleware')
const controller = require('../controllers/example.controller')

router.get('/example', auth(), controller.read)

module.exports = router
