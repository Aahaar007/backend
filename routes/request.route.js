const router = require('express').Router()

const auth = require('../middlewares/auth.middleware')
const controller = require('../controllers/request.controller')

router.post('/request', auth(), controller.add)
// router.delete('/request/cancel', auth(), controller.cancel)
// router.delete('/request/fulfill', auth(), controller.fulfill)

module.exports = router
