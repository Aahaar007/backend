const mongoose = require('mongoose')
const Joi = require('joi')
const enums = require('../constants/enums')
const schemas = require('../constants/schemas')
Joi.objectId = require('joi-objectid')(Joi)

const foodListingSchema = new mongoose.Schema(
  {
    donorId: {
      type: String,
      ref: schemas.User,
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
      enum: [enums.foodListing.NGO, enums.foodListing.Individual],
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
      type: Date,
      required: true,
    },
    requestQueue: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: schemas.Request,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

const FoodListing = mongoose.model(schemas.FoodListing, foodListingSchema)

const validateCreate = (data) => {
  const schema = Joi.object({
    quantity: Joi.number().required(),
    description: Joi.string().required(),
    typeOfDonor: Joi.string()
      .valid(enums.foodListing.NGO, enums.foodListing.Individual)
      .required(),
    isVeg: Joi.boolean().required(),
    address: Joi.string(),
    timeOfExpiry: Joi.number().required(),
  })
  return schema.validate(data)
}

const validateId = (data) => {
  const schema = Joi.object({
    id: Joi.objectId().required(),
  })
  return schema.validate(data)
}

const validateUpdate = (data) => {
  const schema = Joi.object({
    quantity: Joi.number(),
    description: Joi.string(),
    typeOfDonor: Joi.string().valid(
      enums.foodListing.NGO,
      enums.foodListing.Individual
    ),
    isVeg: Joi.boolean(),
    address: Joi.string(),
    timeOfExpiry: Joi.number(),
  })
  return schema.validate(data)
}

exports.FoodListing = FoodListing
exports.validateCreate = validateCreate
exports.validateId = validateId
exports.validateUpdate = validateUpdate
