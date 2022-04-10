const Joi = require('joi')
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
      enum: ['ACTIVE', 'FULFILLED', 'CANCELLED', 'EXPIRED'],
    },
  },
  { timestamps: true }
)

const Request = mongoose.model('Request', requestSchema)

const validateCreate = (data) => {
  const schema = Joi.object({
    orderId: Joi.objectId().required(),
    amount: Joi.number().min(1).required(),
  })
  return schema.validate(data)
}

exports.Request = Request
exports.validateCreate = validateCreate
