const admin = require('firebase-admin')

module.exports = () => {
  return async (req, res, next) => {
    try {
      let token = req.header('Authorization')
      if (!token) throw new Error('Auth token not provided.')
      token = token.replace('Bearer ', '')
      const decodedToken = await admin.auth().verifyIdToken(token)
      req.uid = decodedToken.uid
      next()
    } catch (e) {
      console.log(e)
      let { message, code } = e
      if (code) {
        code = code.split('/').pop().split('-').join(' ')
        code = code.charAt(0).toUpperCase() + code.slice(1)
      }
      res
        .status(401)
        .send({ error: 'Access denied', message: code ? code : message })
    }
  }
}
