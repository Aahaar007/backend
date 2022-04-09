const mongoose = require('mongoose')
const { FoodListing } = require('../models/foodListing.model')
const { Request, validateCreate } = require('../models/request.model')

const add = async (req, res) => {
  const { error } = validateCreate(req.body)
  if (error) return res.status(400).send({ error: error.message })

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

module.exports = { add }
