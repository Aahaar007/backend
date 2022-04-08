const mongoose = require('mongoose')
const Joi = require('joi')
const { boolean } = require('joi')

const foodListingSchema = new mongoose.Schema(
  {
    donorId: {
      type: String,
      ref: 'User',
    },
    quantity: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    typeOfDonor: {
      type: String,
      enum: ['NGO', 'Individual'],
      required: true,
    },
    isVeg: {
      type: Boolean,
      required: true,
    },
    photos: {
      type: [String],
    },
    address: {
      type: String,
      required: false,
    },
    timeOfExpiry: {
      type: String,
      required: true,
    },
    requestQueue: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Request',
    },
    isActive:{
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

const FoodListing = mongoose.model('FoodListing', foodListingSchema)

const validateCreate = (data) => {
  const schema = Joi.object({
    quantity: Joi.number().required(),
    description: Joi.string().required(),
    typeOfDonor: Joi.string().valid('NGO', 'Individual').required(),
    isVeg: Joi.boolean().required(),
    address: Joi.string(),
    timeOfExpiry: Joi.string().required(),
  })
  return schema.validate(data)
}
const validateDeactivate = (data) => {
  const schema = Joi.object({
    id: Joi.string().required(),
  })
  return schema.validate(data)
}
exports.FoodListing = FoodListing
exports.validateCreate = validateCreate
exports.validateDeactivate = validateDeactivate
