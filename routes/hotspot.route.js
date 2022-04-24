const router = require('express').Router()

const auth = require('../middlewares/auth.middleware')
const controller = require('../controllers/hotspot.controller')
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

const upload = multer({
  storage: multerS3({
    s3: s3,
    acl: 'private',
    bucket: CONFIG.AWS_S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname })
    },

    key: (req, file, cb) => {
      cb(null, new Date().getTime() + '_' + req.uid + '_' + file.originalname)
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

router.post('/hotspot', auth(), upload.single('imgSrc'), controller.add)

router.get('/hotspot', auth(), controller.read)

module.exports = router
