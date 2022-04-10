const mongoose = require('mongoose')
const { FoodListing } = require('../models/foodListing.model')
const { Request, validateCreate } = require('../models/request.model')

const add = async (req, res) => {
  const { error } = validateCreate(req.body)
  if (error) return res.status(400).send({ error: error.message })

  const check = await Request.find({
    orderId: req.body.orderId,
    uid: req.uid,
    status: { $in: ['FULFILLED', 'ACTIVE'] },
  })

  if (check)
    return res
      .status(403)
      .send({ error: 'Multiple requests on a listing are not allowed.' })

  const session = await mongoose.connection.startSession()
  try {
    let request = new Request({
      uid: req.uid,
      status: 'ACTIVE',
      ...req.body,
    })

    session.startTransaction()
    await request.save({ session })
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

    if (request.status !== 'ACTIVE') {
      session.endSession()
      return res.status(404).send({
        error: `Food Request was ${request.status.toLocaleLowerCase()}`,
      })
    }

    session.startTransaction()
    await Request.findOneAndUpdate(
      { _id: id },
      { status: 'CANCELLED' },
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

    if (request.status !== 'ACTIVE') {
      session.endSession()
      return res.status(404).send({
        error: `Food Request was ${request.status.toLocaleLowerCase()}`,
      })
    }

    console.log(request)

    session.startTransaction()
    await Request.findOneAndUpdate(
      { _id: id },
      { status: 'FULFILLED' },
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
