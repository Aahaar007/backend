const { FoodListing } = require('../models/foodListing.model')
const { Request } = require('../models/request.model')
const expireListing = require('../utility/expireListing')

module.exports = () => {
  return async (req, res, next) => {
    try {
      const request = await Request.findById(req.params.id)
      if (!request) {
        return res.status(404).send({
          error: 'Food Request not found.',
        })
      }
      const foodListing = await FoodListing.findById(request.orderId)
      if (!foodListing || !foodListing.isActive) {
        return res.status(404).send({
          error: 'Food Listing not found.',
        })
      }

      const currDate = new Date()
      if (
        request.status === 'EXPIRED' ||
        foodListing['timeOfExpiry'].getTime() < currDate.getTime()
      ) {
        await expireListing(request.orderId)
        return res.status(400).send({ error: 'The request has expired.' })
      }
      next()
    } catch (e) {
      return res.status(500).send({ error: e.message })
    }
  }
}
