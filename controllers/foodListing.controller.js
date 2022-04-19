const mongoose = require('mongoose')

const {
  FoodListing,
  validateCreate,
  validateId,
  validateUpdate,
} = require('../models/foodListing.model')

const preSigner = require('../utility/urlGenerator')
const deleteS3Object = require('../utility/deleteS3Object')
const expireListing = require('../utility/expireListing')

const add = async (req, res) => {
  const { error } = req.body
  if (error) return res.status(400).send({ error: error.message })
  try {
    let foodListing = new FoodListing({
      donorId: req.uid,
      ...req.body,
      timeOfExpiry: new Date(
        new Date().getTime() + req.body.timeOfExpiry * 60000
      ),
      photos:
        req.files && req.files['refImage']
          ? req.files['refImage'].map((file) => file.key)
          : [],
    })
    await foodListing.save()
    foodListing = foodListing.toObject()
    foodListing.photos = await preSigner(foodListing.photos)
    return res.status(200).send({
      message: 'Food listing created successfully.',
      foodListing,
    })
  } catch (e) {
    console.log(e)
    return res.status(500).send({ error: e.message })
  }
}

const readOne = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(500).send({
      error: 'Invalid ID.',
    })
  }
  try {
    const foodListing = await FoodListing.findById(req.params.id)
      .populate('requestQueue', 'amount')
      .lean()
    if (!foodListing || !foodListing.isActive) {
      return res.status(404).send({
        error: 'Food Listing not found.',
      })
    }
    foodListing.photos = await preSigner(foodListing.photos)
    return res.status(200).send({ foodListing })
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
}

const read = async (req, res) => {
  const fields = ['isVeg', 'typeOfDonor', 'quantity', 'isActive']
  const filter = {
    timeOfExpiry: {
      $gte: new Date(),
    },
  }
  fields.forEach((fields) => {
    if (req.query[fields]) filter[fields] = req.query[fields]
  })
  try {
    const foodListings = await FoodListing.find(filter)
      .limit(10)
      .sort({
        createdAt: -1,
      })
      .populate('requestQueue', 'amount')
      .lean()
    await Promise.all(
      foodListings.map(async (foodListing) => {
        // console.log(foodListing.photos)
        foodListing.photos = await preSigner(foodListing.photos)
      })
    )
    return res.status(200).send({ foodListings })
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
}

const updateOne = async (req, res) => {
  const id = req.params.id
  if (!id || !mongoose.isValidObjectId(id))
    return res.status(400).send({ error: 'Invalid ID.' })
  const donorId = req.uid

  const { error } = validateUpdate(req.body)
  if (error) return res.status(400).send({ error: error.message })

  const updateQuery = {}
  const fields = ['quantity', 'description', 'typeOfDonor', 'isVeg', 'address']

  fields.forEach((field) => {
    if (field !== 'timeOfExpiry' && req.body[field])
      updateQuery[field] = req.body[field]
  })

  if (req.files.photos) {
    updateQuery.photos = req.files.photos.map((photo) => photo.key)
  } else {
    updateQuery.photos = []
  }

  try {
    let foodListing = await FoodListing.findOne({ _id: id, donorId })
    //timeOfExpiry field updated here

    if (!foodListing)
      return res.status(404).send({ error: 'Food Listing not found.' })

    if (req.body['timeOfExpiry'])
      updateQuery['timeOfExpiry'] =
        foodListing.createdAt.getTime() + req.body['timeOfExpiry'] * 60000

    if (updateQuery.photos.length > 0) {
      deleteS3Object(foodListing.photos)
    }
    Object.keys(updateQuery).forEach((field) => {
      foodListing[field] = updateQuery[field]
    })
    await foodListing.save()
    foodListing = foodListing.toObject()
    foodListing.photos = await preSigner(foodListing.photos)
    return res
      .status(200)
      .send({ message: 'Food Listing updated successfully.', foodListing })
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
}

const deactivate = async (req, res) => {
  const { error } = validateId(req.params)
  if (error) return res.status(400).send({ error: error.message })
  try {
    const listingID = req.params.id
    const updatedFoodListing = await FoodListing.findById(listingID)

    if (!updatedFoodListing) {
      return res.status(404).send({
        error: 'Food listing not found',
      })
    }

    await expireListing(listingID)
    return res.status(200).send({
      message: 'Food listing successfully Deactivated.',
      updatedFoodListing,
    })
  } catch (e) {
    return res.status(500).send({ error: e })
  }
}

module.exports = {
  add,
  readOne,
  read,
  updateOne,
  deactivate,
}
