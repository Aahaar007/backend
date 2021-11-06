const mongoose = require("mongoose");
const Joi = require('joi');
const _ = require('lodash');

const userSchema = new mongoose.Schema({
    uid:{
        type: String,
    },
    name: {
        type:String,
        required: true,
        minlength : 4,
        maxlength: 50,
        trim: true,
    },
    phone: {
       type: Number,
       required: true,
       minlength: 9,
       maxlength: 9,
    },
    password: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 1024,
    },
    food: {
       listed:[{
           id: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'FoodOrder',
               required: true
           }
       }],
       donated: [{
           id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FoodOrder',
            required: true 
           }
       }],
       recieved: [{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FoodOrder',
            required: true 
           }
       }]
    },
    
    address: {
        type: String,
        required: true,
     },

     isVerified :{
         type: Boolean,
         default: false,
         required: true,
     },

     onboardingStatus: {
         type: Boolean,
         default: false,
     }

});

const User= mongoose.model('User', userSchema);

exports.User = User;