const Joi = require('joi')
const mongoose = require('mongoose')
const enums = require('../constants/enums')
const schemas = require('../constants/schemas')

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
      enum: [
        enums.request.ACTIVE,
        enums.request.FULFILLED,
        enums.request.CANCELLED,
        enums.request.EXPIRED,
      ],
    },
    code: {
      type: String,
      length: 12,
    },
  },
  { timestamps: true }
)

const Request = mongoose.model(schemas.Request, requestSchema)

const validateCreate = (data) => {
  const schema = Joi.object({
    orderId: Joi.objectId().required(),
    amount: Joi.number().min(1).required(),
    code: Joi.string().length(12),
  })
  return schema.validate(data)
}

exports.Request = Request
exports.validateCreate = validateCreate
