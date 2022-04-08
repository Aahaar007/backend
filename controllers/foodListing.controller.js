const { FoodListing, validateCreate, validateDeactivate } = require('../models/foodListing.model')

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
<<<<<<< HEAD
const deactivate = async (req,res)=>{
    const {error}= validateDeactivate(req.body)
    if (error) return res.status(400).send({ error: error.message })
    try {
      const donorID = req.uid;
      const listingID= req.body.id;
      const foodListing = await FoodListing.findById(listingID);
      if(foodListing.donorId===donorID)
      {
         const updatedFoodListing =await FoodListing.findOneAndUpdate({_id : listingID},{isActive : false} , {new : true})
         return res.status(200).send({
            message: 'Food listing successfully Deactivated.',
            updatedFoodListing,
         })
      }
      return res.status(400).send({
        message: "User Dont have rights to Deactivate this listing"
      })
    } catch (e) {
      return res.status(500).send({ error: e.message })
    }
}
const getOne = async (req,res) =>{
      const id=req.body.id;
      try {
        const food = await FoodListing.findById(id);
        if(food.isActive===false)
        {
          return  res.status(200).send("This foodListing no longer exist");
        }
        return res.status(200).send(food);
      } catch (e) {
        return res.status(500).send({ error: e.message })
      }
}
module.exports = {
  add,
  deactivate,
  getOne
=======

const getAllDonations = async (req, res) => {
  try {
    const response = await FoodListing.find().sort({ createdAt: -1 })
    return res.status(200).json(response)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
}

module.exports = {
  add,
  getAllDonations,
>>>>>>> ed6691b2f83edf9a05353f8aff7f83c731d4c3d6
}
