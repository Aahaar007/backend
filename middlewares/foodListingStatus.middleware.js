const { FoodListing } = require('../models/foodListing.model')
const expireListing = require('../utility/expireListing')

module.exports = () => {
  return async (req, res, next) => {
    try {
      const foodListing = await FoodListing.findById(req.params.id).lean()
      const currDate = new Date()

      if (!foodListing || !foodListing.isActive) {
        return res.status(404).send({
          error: 'Food Listing not found.',
        })
      }

      if (foodListing['timeOfExpiry'].getTime() < currDate.getTime()) {
        await expireListing(req.params.id)
      }
      next()
    } catch (e) {
      return res.status(500).send({ error: e.message })
    }
  }
}
