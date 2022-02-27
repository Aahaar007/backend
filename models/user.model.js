const mongoose = require('mongoose')
const Joi = require('joi').extend(require('@joi/date'))
const _ = require('lodash')

const characterEnums = ['M', 'T', 'F']

const phoneSchmea = new mongoose.Schema(
  {
    region: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 4,
    },
    number: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 12,
    },
  },
  { _id: false }
)

const userSchema = new mongoose.Schema(
  {
    _id: String,
    name: {
      type: String,
      required: false,
      minlength: 1,
      maxlength: 50,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    phone: {
      type: phoneSchmea,
      required: true,
      unique: true,
    },
    food: {
      listed: [
        {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FoodOrder',
            required: true,
          },
        },
      ],
      donated: [
        {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FoodOrder',
            required: true,
          },
        },
      ],
      recieved: [
        {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FoodOrder',
            required: true,
          },
        },
      ],
      required: false,
    },
    address: {
      type: String,
      min: 3,
      max: 128,
      required: false,
    },
    dob: {
      type: Date,
      required: false,
    },
    gender: {
      type: String,
      enum: characterEnums,
    },
    profileURL: {
      type: String,
    },
  },
  { timestamps: true }
)

const User = mongoose.model('User', userSchema)

const validateCreateUser = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: ['com', 'in', 'net'] } })
      .required(),
    phone: Joi.object({
      region: Joi.string().regex(/^\+\d{1,3}$/),
      number: Joi.string().regex(/^\d{6,12}$/),
    }).required(),
  })
  return schema.validate(data)
}

const validateUpdateUser = (data) => {
  const name = { min: 1, max: 50 }
  const address = { min: 3, max: 128 }
  const dateFormat = 'DD/MM/YYYY'
  const schema = Joi.object({
    name: Joi.string()
      .min(name.min)
      .max(name.max)
      .messages({
        'string.base': `name should be a string`,
        'string.empty': `name cannot be empty`,
        'string.min': `name should be at-least ${name.min} characters long.`,
        'string.max': `name should be at-most ${name.max} characters long.`,
      }),
    address: Joi.string()
      .min(address.min)
      .max(address.max)
      .messages({
        'string.base': `address should be a string`,
        'string.empty': `address cannot be empty`,
        'string.min': `address should be at-least ${address.min} characters long.`,
        'string.max': `address should be at-most ${address.max} characters long.`,
      }),
    dob: Joi.date()
      .format(dateFormat)
      .max(Date.now())
      .messages({
        'date.format': `dob should be in the format ${dateFormat}`,
        'date.max': `dob cannot be greater than today.`,
      }),
    gender: Joi.string().valid('M', 'T', 'F').messages({
      'string.invalid': `Only valid values for the gender field are 'M', 'F', and 'T'`,
    }),
    profileURL: Joi.string(),
  }).messages({
    'object.unknown': 'Invalid fields passed.',
  })
  return schema.validate(data)
}

const validateExisting = (data) => {
  const schema = Joi.object({
    phone: Joi.object({
      region: Joi.string().regex(/^\+\d{1,3}$/),
      number: Joi.string().regex(/^\d{6,12}$/),
    }).required(),
  })
  return schema.validate(data)
}

exports.User = User

exports.validateCreateUser = validateCreateUser
exports.validateUpdateUser = validateUpdateUser
exports.validateExisting = validateExisting
