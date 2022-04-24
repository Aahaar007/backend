const mongoose = require('mongoose')
const Joi = require('joi').extend(require('@joi/date'))
const schemas = require('../constants/schemas')
const regex = require('../constants/regex')
const { phoneSchmea } = require('./user.model')

const hotspotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    description: String,
    imgSrc: {
      type: String,
      default: '',
    },
    isNGO: {
      type: Boolean,
      required: false,
      default: false,
    },
    contactNumber: phoneSchmea,
    numberOfReports: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

const Hotspot = mongoose.model(schemas.Hotspot, hotspotSchema)

const validateCreate = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    capacity: Joi.number().required(),
    description: Joi.string(),
    isNGO: Joi.boolean(),
    contactNumber: Joi.object({
      region: Joi.string().regex(regex.region),
      number: Joi.string().regex(regex.number),
    }),
  })
  return schema.validate(data)
}

exports.Hotspot = Hotspot

exports.validateCreate = validateCreate
