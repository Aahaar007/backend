const router = require('express').Router()

const auth = require('../middlewares/auth.middleware')
const controller = require('../controllers/request.controller')
const updateRequestStatus = require('../middlewares/requestStatus.middleware')

router.post('/request', auth(), controller.add)

router.get('/request/:id', auth(), updateRequestStatus(), controller.readOne)

router.get('/request/code/:code', auth(), controller.readOneByCode)

router.delete(
  '/request/cancel/:id',
  auth(),
  updateRequestStatus(),
  controller.cancel
)
router.delete(
  '/request/fulfill/:id',
  auth(),
  updateRequestStatus(),
  controller.fulfill
)

module.exports = router
