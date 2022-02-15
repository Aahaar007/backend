const mongoose = require('mongoose')
const _ = require('lodash')

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
  },
  name: {
    type: String,
    required: true,
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
  },
  phone: {
    type: Number,
    required: true,
    minlength: 9,
    maxlength: 9,
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
  },
  address: {
    type: String,
    required: true,
  },
})

const User = mongoose.model('User', userSchema)

exports.User = User
