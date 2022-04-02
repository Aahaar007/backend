const router = require('express').Router()

const auth = require('../middlewares/auth.middleware')
const controller = require('../controllers/foodListing.controller')
const multer = require('multer')

//TODO: Use S3 bucket.
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/foodListings')
    },
    filename: (req, file, cb) => {
      const fileName = `${new Date().getTime()}_${file.originalname}`
      file.key = `${process.env.BASE_URL}/foodListings/${fileName}`
      cb(null, fileName)
    },
  }),
  limits: {
    fileSize:
      parseInt(process.env.MAX_IMAGE_UPLOAD_SIZE_MB || 30) * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error('Allowed file formats are: png, jpg, jpeg.'))
    }
    cb(undefined, true)
  },
})

router.post(
  '/foodListing',
  auth(),
  upload.fields([{ name: 'refImage', maxCount: 10 }]),
  controller.add
)

module.exports = router
