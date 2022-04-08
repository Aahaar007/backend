const AWS = require('aws-sdk')

const CONFIG = require('../config/config')

const s3 = new AWS.S3({
  accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
  secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
  region: 'ap-south-1',
})

const generator = async (s3keyArray) => {
  const urls = s3keyArray.map((key) => {
    const params = {
      Bucket: CONFIG.AWS_S3_BUCKET_NAME,
      Key: key,
      Expires: 60 * 5,
    }
    return {
      name: key.substr(key.indexOf('_') + 1),
      link: s3.getSignedUrl('getObject', params),
    }
  })
  return urls
}

module.exports = generator
