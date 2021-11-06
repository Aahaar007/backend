const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema(
  {
    orderId: mongoose.Schema.Types.ObjectId,
    uid: String,
    amount: {
      type: Number,
      min: 1,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'CANCELED'],
    },
  },
  { timestamps: true }
)

const Request = mongoose.model('Request', requestSchema)

exports.Request = Request
