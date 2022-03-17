const mongoose = require('mongoose')
const Joi = require('joi')
const _ = require('lodash')
const { trim } = require('lodash')

const foodOrderSchema = new mongoose.Schema(
    {
      donarID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      quantity: {
        type: Number,
        required: true,
      },
      description:{
          type: String,
          required: true,
          trim: true
      },
      typeOfDonar:{
          type: String,
          enum: ['NGO', 'Individual'],
          required: true
      },
      isVeg:{
          type: Boolean,
          required: true
      },
      photos:{
          type:[String]
      },
      address: {
        type: String,
        required: false,
      },
      timeOfExpiry:{
          type: String,
          required: true
      },
      requestQeueu:{
          type:[mongoose.Schema.Types.ObjectId],
          ref:"RequesFood"
      }
    },
    { timestamps: true }
  )

const FoodOrder = mongoose.model('FoodOrder', foodOrderSchema)
exports.FoodOrder = FoodOrder

