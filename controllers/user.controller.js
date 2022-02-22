const {
  validateCreateUser,
  User,
  validateUpdateUser,
} = require('../models/user.model')

//pass a single user object.
//if 'lean()' is not used, pass the _doc field of the user object.
const formatUserResponse = (user) => {
  return {
    ...user,
    phone: user.phone.region + '-' + user.phone.number,
  }
}

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
      user: formatUserResponse(user._doc),
    })
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
}

const update = async (req, res) => {
  const { uid } = req
  const { error } = validateUpdateUser(req.body)
  if (error) return res.status(400).send({ error: error.message })
  const fields = ['name', 'address', 'dob']
  const returnFields = [
    '_id',
    'name',
    'email',
    'phone',
    'food',
    'address',
    'dob',
  ]
  try {
    const updateQuery = {}
    fields.forEach((field) => {
      if (req.body[field]) updateQuery[field] = req.body[field]
    })
    const user = await User.findOneAndUpdate(
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
    return res.status(200).send({
      message: 'user information successfully updated.',
      user: formatUserResponse(user),
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
  ]
  if (!uid) return res.status(400).send({ error: 'user uid must be passed' })
  try {
    const user = await User.findById(uid).select(returnFields).lean()
    if (!user)
      return res.status(404).send({ error: 'invalid uid/user not found.' })
    return res.status(400).send({ user: formatUserResponse(user) })
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
}

const hasProfile = async (req, res) => {
  const { uid } = req
  try {
    const user = await User.findById(uid).lean()
    const { name, address, dob } = user
    return res.status(400).send(!!name && !!address && !!dob)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
}

module.exports = {
  add,
  update,
  readOne,
  hasProfile,
}
