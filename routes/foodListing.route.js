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
router.post('/foodListing/deactivate/',auth(),controller.deactivate)

<<<<<<< HEAD
router.get('/foodListing/getOne/:id',controller.getOne)
=======
router.get('/foodListing/all', controller.getAllDonations)

>>>>>>> ed6691b2f83edf9a05353f8aff7f83c731d4c3d6
module.exports = router
