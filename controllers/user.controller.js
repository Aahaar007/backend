const {
  validateCreateUser,
  User,
  validateUpdateUser,
  validateExisting,
} = require('../models/user.model')

const deleteS3Object = require('../utility/deleteS3Object')
const preSigner = require('../utility/urlGenerator')

const { FoodListing } = require('../models/foodListing.model')
const { Request } = require('../models/request.model')

const enums = require('../constants/enums')

const add = async (req, res) => {
  const uid = req.uid
  const { error } = validateCreateUser(req.body)
  if (error) return res.status(400).send({ error: error.message })
  try {
    const { phone, email } = req.body
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }, { _id: uid }],
    }).lean()
    if (existingUser)
      return res.status(400).send({ error: 'user already registered.' })
    const user = new User({
      _id: uid,
      ...req.body,
    })
    await user.save()
    return res.status(200).send({
      message: 'user created successfully.',
      user,
    })
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
}

const updateOne = async (req, res) => {
  const { uid } = req
  const { error } = validateUpdateUser(req.body)
  if (error) return res.status(400).send({ error: error.message })
  const fields = ['name', 'address', 'dob', 'gender']
  const returnFields = [
    '_id',
    'name',
    'email',
    'phone',
    'food',
    'address',
    'dob',
    'gender',
    'profileURL',
  ]
  try {
    const updateQuery = {}
    fields.forEach((field) => {
      if (req.body[field]) updateQuery[field] = req.body[field]
    })
    if (req.file) updateQuery.profileURL = req.file.key

    let user = await User.findOne({ _id: uid }).lean()
    if (updateQuery.profileURL && user.profileURL !== '') {
      deleteS3Object([user.profileURL])
      console.log('called')
    }
    user = await User.findOneAndUpdate(
      { _id: uid },
      {
        $set: updateQuery,
      },
      {
        new: true,
      }
    )
      .select(returnFields)
      .lean()
    const profileURL = await preSigner(user.profileURL ? [user.profileURL] : [])
    user.profileURL = profileURL.length > 0 ? profileURL[0] : ''
    return res.status(200).send({
      message: 'user information successfully updated.',
      user,
    })
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
}

const readOne = async (req, res) => {
  const { uid } = req.params
  const returnFields = [
    '_id',
    'name',
    'email',
    'phone',
    'food',
    'address',
    'dob',
    'gender',
    'profileURL',
  ]
  if (!uid) return res.status(400).send({ error: 'user uid must be passed' })
  try {
    const user = await User.findById(uid).select(returnFields).lean()
    if (!user)
      return res.status(404).send({ error: 'invalid uid/user not found.' })
    const profileURL = await preSigner(user.profileURL ? [user.profileURL] : [])
    user.profileURL = profileURL.length > 0 ? profileURL[0] : ''
    return res.status(200).send({ user })
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
}

const hasProfile = async (req, res) => {
  const { uid } = req
  try {
    const user = await User.findById(uid).lean()
    const { name, address, dob } = user
    return res.status(200).send(!!name && !!address && !!dob)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
}

const checkExisting = async (req, res) => {
  const { error } = validateExisting(req.body)
  if (error) return res.status(400).send({ error: error.message })
  const { phone } = req.body
  try {
    const user = await User.findOne({ phone }).lean()
    return res.status(200).send(!!user)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
}

const readAllFoodListings = async (req, res) => {
  const { uid } = req
  try {
    const foodListings = await FoodListing.find({ donorId: uid })
      .sort({
        isActive: -1,
        timeOfExpiry: -1,
        quantity: -1,
      })
      .lean()
    await Promise.all(
      foodListings.map(async (foodListing) => {
        foodListing.photos = await preSigner(foodListing.photos)
      })
    )
    return res.status(200).send({ foodListings })
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
}

const readAllRequests = async (req, res) => {
  const { uid } = req
  try {
    const pipeline = [
      {
        $match: {
          uid,
        },
      },
      {
        $addFields: {
          sortField: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: ['$status', enums.request.ACTIVE],
                  },
                  then: 0,
                },
                {
                  case: {
                    $eq: ['$status', enums.request.FULFILLED],
                  },
                  then: 1,
                },
                {
                  case: {
                    $eq: ['$status', enums.request.CANCELLED],
                  },
                  then: 2,
                },
                {
                  case: {
                    $eq: ['$status', enums.request.EXPIRED],
                  },
                  then: 3,
                },
              ],
              default: 4,
            },
          },
        },
      },
      {
        $sort: {
          sortField: 1,
        },
      },
      {
        $project: {
          sortField: 0,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'uid',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $lookup: {
          from: 'foodlistings',
          localField: 'orderId',
          foreignField: '_id',
          as: 'foodListingDetails',
        },
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$foodListingDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          donorName: {
            $ifNull: ['$userDetails.name', 'NA'],
          },
          description: {
            $ifNull: ['$foodListingDetails.description', 'NA'],
          },
        },
      },
      {
        $project: {
          userDetails: 0,
          foodListingDetails: 0,
        },
      },
    ]
    const requests = await Request.aggregate(pipeline)
    return res.status(200).send({ requests })
  } catch (e) {
    console.log(e)
    return res.status(500).send({ error: e.message })
  }
}

module.exports = {
  add,
  updateOne,
  readOne,
  hasProfile,
  checkExisting,
  readAllFoodListings,
  readAllRequests,
}
