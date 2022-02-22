const router = require('express').Router()

const auth = require('../middlewares/auth.middleware')
const controller = require('../controllers/user.controller')

router.post('/user', auth(), controller.add)

router.patch('/user', auth(), controller.update)

module.exports = router
