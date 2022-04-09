const { FoodListing, validateCreate, validateId} = require('../models/foodListing.model')
const mongoose = require('mongoose')
const add = async (req, res) => {
  const { error } = validateCreate(req.body)
  if (error) return res.status(400).send({ error: error.message })
  try {
    const foodListing = new FoodListing({
      donorId: req.uid,
      ...req.body,
      photos: req.files['refImage']
        ? req.files['refImage'].map((file) => file.key)
        : [],
    })
    await foodListing.save()
    return res.status(200).send({
      message: 'Food listing created successfully.',
      foodListing,
    })
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
}
const deactivate = async (req,res)=>{
    const {error}= validateId(req.body)
    if (error) return res.status(400).send({ error: error.message })
    try {
      const donorID = req.uid;
      const listingID= req.body.id;
         const updatedFoodListing =await FoodListing.findOneAndUpdate({_id : listingID, donarId:donorID},{isActive : false} , {new : true})
         if(!updatedFoodListing)
         {
            return res.status(404).send({
              error: "Food listing not found"
            })
         }
         return res.status(200).send({
            message: 'Food listing successfully Deactivated.',
            updatedFoodListing,
         })
    } catch (e) {
      return res.status(500).send({ error: e.message })
    }
}
const getOne = async (req,res) =>{
      if(!mongoose.isValidObjectId(req.params.id))
      {
          return res.status(500).send({
            error: "Invalid Id"
          });
      }
      try {
        const food = await FoodListing.findById(req.params.id);
        if(!food || !food.isActive)
        {
          return  res.status(404).send({
            error: "Foodlisting not found"
          });
        }
        return res.status(200).send({food});
      } catch (e) {
        return res.status(500).send({ error: e.message })
      }
}
const getAllDonations = async (req, res) => {
  const fields = ['isVeg', 'typeOfDonor', 'quantity']
  const filterQuery = {}
  fields.forEach((fields) => {
    if (req.query[fields]) filterQuery[fields] = req.query[fields]
  })
  try {
    const response = await FoodListing.find(filterQuery).limit(10).sort({
      createdAt: -1,
    })
    return res.status(200).json(response)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
}
module.exports = {
  add,
  deactivate,
  getOne,
  getAllDonations
}
