const AWS = require('aws-sdk')

const CONFIG = require('../config/config')

const s3 = new AWS.S3({
  accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
  secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
  region: 'ap-south-1',
})

const deleteS3Object = async (s3KeyArray) => {
  try {
    const res = s3KeyArray.map((key) => {
      return s3.deleteObject({
        Bucket: CONFIG.AWS_S3_BUCKET_NAME,
        Key: key,
      })
    })
    return res
  } catch (err) {
    return new Error('Failed to delete from s3.')
  }
}

module.exports = deleteS3Object
