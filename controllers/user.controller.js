const { validateCreateUser, User } = require('../models/user.model')

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

module.exports = {
  add,
}
