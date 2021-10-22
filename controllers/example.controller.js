//contains controllers for specific routes.
//example for a read controller

const read = async (req, res) => {
  try {
    return res.status(200).send('success.')
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
}

module.exports = {
  read,
}
