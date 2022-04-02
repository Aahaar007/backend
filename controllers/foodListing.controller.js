const { FoodListing, validateCreate } = require('../models/foodListing.model')

const add = async (req, res) => {
  const { error } = validateCreate(req.body)
  if (error) return res.status(400).send({ error: error.message })
  try {
    const foodListing = new FoodListing({
      donorId: req.uid,
      ...req.body,
      photos: req.files['refImage']
        ? req.files['refImage'].map((file) => file.key)
        : [],
    })
    await foodListing.save()
    return res.status(200).send({
      message: 'Food listing created successfully.',
      foodListing,
    })
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
}

module.exports = {
  add,
}
