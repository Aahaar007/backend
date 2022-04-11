const mongoose = require('mongoose')
const enums = require('../constants/enums')
const { FoodListing } = require('../models/foodListing.model')
const { Request, validateCreate } = require('../models/request.model')
const expireListing = require('../utility/expireListing')

const add = async (req, res) => {
  const { error } = validateCreate(req.body)
  if (error) return res.status(400).send({ error: error.message })

  try {
    const check = await Request.findOne({
      orderId: req.body.orderId,
      uid: req.uid,
      status: { $in: [enums.request.FULFILLED, enums.request.ACTIVE] },
    }).lean()

    if (check)
      return res
        .status(403)
        .send({ error: 'Multiple requests on a listing are not allowed.' })
  } catch (e) {
    console.log(e)
    return res.status(500).send({ error: e.message })
  }

  const session = await mongoose.connection.startSession()
  try {
    let request = new Request({
      uid: req.uid,
      status: enums.request.ACTIVE,
      ...req.body,
    })

    session.startTransaction()
    await request.save({ session })

    const foodListing = await FoodListing.findOne({
      _id: req.body.orderId,
    }).lean()

    if (!foodListing) {
      session.endSession()
      return res.status(404).send({ error: 'Food Listing not found.' })
    } else if (foodListing.donorId === req.uid) {
      session.endSession()
      return res
        .status(400)
        .send({ error: 'Donors cannot request food from their own listings.' })
    } else if (foodListing['timeOfExpiry'].getTime() < new Date().getTime()) {
      if (foodListing.isActive) await expireListing(foodListing._id)
      session.endSession()
      return res.status(400).send({ error: 'The food listing has expired.' })
    }

    await FoodListing.updateOne(
      { _id: req.body.orderId },
      { $addToSet: { requestQueue: request._id } }
    ).session(session)

    await session.commitTransaction()

    res.status(200).send({
      message: 'Request added successfully',
      request,
    })
  } catch (e) {
    await session.abortTransaction()
    console.log(e)
    res.status(500).send({ error: e.message })
  }

  session.endSession()
}

const cancel = async (req, res) => {
  const id = req.params.id
  if (!id || !mongoose.isValidObjectId(id))
    return res.status(400).send({ error: 'Invalid ID.' })

  const session = await mongoose.connection.startSession()
  try {
    const request = await Request.findById(id)
    if (!request) {
      session.endSession()
      return res.status(404).send({
        error: 'Food Request not found.',
      })
    }

    if (request.status !== enums.request.ACTIVE) {
      session.endSession()
      return res.status(404).send({
        error: `Food Request was ${request.status.toLocaleLowerCase()}`,
      })
    }

    session.startTransaction()
    await Request.findOneAndUpdate(
      { _id: id },
      { status: enums.request.CANCELLED },
      { session }
    )
    await FoodListing.updateOne(
      { _id: request.orderId },
      { $pullAll: { requestQueue: [id] } },
      { session }
    )

    await session.commitTransaction()
    res.status(200).send({
      message: 'Request Cancelled successfully',
      request,
    })
  } catch (e) {
    await session.abortTransaction()
    res.status(500).send({ error: e.message })
  }
  session.endSession()
}

const readOne = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(500).send({
      error: 'Invalid ID.',
    })
  }
  try {
    const request = await Request.findById(req.params.id)
    if (!request) {
      return res.status(404).send({
        error: 'Food Request not found.',
      })
    }
    return res.status(200).send({ request })
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
}

const fulfill = async (req, res) => {
  const id = req.params.id
  if (!id || !mongoose.isValidObjectId(id))
    return res.status(400).send({ error: 'Invalid ID.' })

  const session = await mongoose.connection.startSession()
  try {
    const request = await Request.findById(id)
    if (!request) {
      session.endSession()
      return res.status(404).send({
        error: 'Food Request not found.',
      })
    }

    const foodListing = await FoodListing.findById(request.orderId)
    if (!foodListing) {
      session.endSession()
      return res.status(404).send({
        error: 'Food Listing not found.',
      })
    }

    if (foodListing.donorId !== req.uid) {
      session.endSession()
      return res.status(401).send({
        error: 'Access denied',
        message: 'Only donor is allowed to fulfill requests.',
      })
    }

    if (request.status !== enums.request.ACTIVE) {
      session.endSession()
      return res.status(404).send({
        error: `Food Request was ${request.status.toLocaleLowerCase()}`,
      })
    }

    session.startTransaction()
    await Request.findOneAndUpdate(
      { _id: id },
      { status: enums.request.FULFILLED },
      { session }
    )
    await FoodListing.updateOne(
      { _id: request.orderId },
      {
        $pullAll: { requestQueue: [id] },
        $inc: { quantity: -request.amount },
      },
      { session }
    )
    await FoodListing.updateOne(
      { _id: request.orderId, quantity: { $lt: 0 } },
      { $set: { quantity: 0 } },
      { session }
    )

    await session.commitTransaction()
    res.status(200).send({
      message: 'Request fulfilled',
      request,
    })
  } catch (e) {
    await session.abortTransaction()
    res.status(500).send({ error: e.message })
  }
  session.endSession()
}

module.exports = { add, cancel, fulfill, readOne }
