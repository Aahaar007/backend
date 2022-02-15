const router = require('express').Router()

const auth = require('../middlewares/auth.middleware')
const controller = require('../controllers/user.controller')

router.post('/user', auth(), controller.add)

module.exports = router
