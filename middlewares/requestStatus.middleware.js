const { FoodListing } = require('../models/foodListing.model')
const { Request } = require('../models/request.model')
const expireListing = require('../utility/expireListing')

module.exports = () => {
  return async (req, res, next) => {
    try {
      const request = await Request.findById(req.params.id)
      const foodListing = await FoodListing.findById(request.orderId)
      if (!request) {
        return res.status(404).send({
          error: 'Food Request not found.',
        })
      }
      if (!foodListing) {
        return res.status(404).send({
          error: 'Food Listing not found.',
        })
      }

      const currDate = new Date()
      if (foodListing['timeOfExpiry'].getTime() < currDate.getTime()) {
        await expireListing(req.params.id)
      }
      next()
    } catch (e) {
      return res.status(500).send({ error: e.message })
    }
  }
}
