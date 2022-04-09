const { FoodListing } = require('../models/foodListing.model')

module.exports = () => {
  return async (req, res, next) => {
    try {
      const foodListing = await FoodListing.findById(req.params.id).lean()
      const currDate = new Date()

      if (foodListing['timeOfExpiry'].getTime() < currDate.getTime()) {
        await FoodListing.findOneAndUpdate(
          { _id: req.params.id },
          { isActive: false }
        )
        //TODO: expire all requests
      }
      next()
    } catch (e) {
      return res.status(500).send({ error: e.message })
    }
  }
}
