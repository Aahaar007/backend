const { FoodListing } = require('../models/foodListing.model')
const { Request } = require('../models/request.model')
const mongoose = require('mongoose')

module.exports = async (id) => {
  const session = await mongoose.connection.startSession()
  try {
    session.startTransaction()
    await FoodListing.findOneAndUpdate(
      { _id: id },
      { $set: { isActive: false, requestQueue: [] } },
      { session }
    )
    await Request.updateMany(
      { orderId: id, status: 'ACTIVE' },
      { $set: { status: 'EXPIRED' } },
      { session }
    )
    await session.commitTransaction()
  } catch (e) {
    await session.abortTransaction()
    throw e
  }
}
