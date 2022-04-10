const router = require('express').Router()

const auth = require('../middlewares/auth.middleware')
const updateFoodListingStatus = require('../middlewares/foodListingStatus.middleware')
const controller = require('../controllers/foodListing.controller')
const CONFIG = require('../config/config')
const multer = require('multer')

const AWS = require('aws-sdk')
var multerS3 = require('multer-s3')

const s3 = new AWS.S3({
  accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
  secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
  region: 'ap-south-1',
})

//TODO: Use S3 bucket.
const upload = multer({
  storage: multerS3({
    s3: s3,
    acl: 'private',
    bucket: CONFIG.AWS_S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname })
    },

    key: (req, file, cb) => {
      cb(null, new Date().getTime() + '_' + file.originalname)
    },
  }),
  limits: {
    fileSize: parseInt(CONFIG.MAX_IMAGE_UPLOAD_SIZE_MB || 30) * 1024 * 1024,
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

router.get(
  '/foodListing/:id',
  auth(),
  updateFoodListingStatus(),
  controller.readOne
)

router.get('/foodListing', auth(), controller.read)

router.delete('/foodListing/deactivate/:id', auth(), controller.deactivate)

router.put(
  '/foodListing/:id',
  auth(),
  updateFoodListingStatus(),
  upload.fields([{ name: 'photos', maxCount: 10 }]),
  controller.updateOne
)

module.exports = router
