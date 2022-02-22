const mongoose = require('mongoose')
const Joi = require('joi')
const _ = require('lodash')

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
      length: 10,
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
      minlength: 4,
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
      required: false,
    },
    dob: {
      type: Date,
      required: false,
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
      number: Joi.string().regex(/^\d{10}$/),
    }).required(),
  })
  return schema.validate(data)
}

exports.User = User

exports.validateCreateUser = validateCreateUser
