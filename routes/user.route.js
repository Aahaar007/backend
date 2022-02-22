const router = require('express').Router()

const auth = require('../middlewares/auth.middleware')
const controller = require('../controllers/user.controller')

router.post('/user', auth(), controller.add)

router.patch('/user', auth(), controller.update)

router.get('/user/:uid?', controller.readOne)

router.get('/user/hasProfile', auth(), controller.hasProfile)

module.exports = router
