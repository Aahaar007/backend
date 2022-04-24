const { Hotspot, validateCreate } = require('../models/hotspot.model')

const preSigner = require('../utility/urlGenerator')

const add = async (req, res) => {
  const { error } = validateCreate(req.body)
  if (error) return res.status(404).send({ error: error.message })
  try {
    let hotspot = new Hotspot({
      ...req.body,
      imgSrc: req.file ? req.file.key : '',
      createdBy: req.uid,
    })
    await hotspot.save()
    hotspot = hotspot.toObject()
    const imgSrc = await preSigner(hotspot.imgSrc ? [hotspot.imgSrc] : [])
    hotspot.imgSrc = imgSrc.length > 0 ? imgSrc[0] : ''
    return res.status(200).send({
      message: 'hotspot created successfully.',
      hotspot,
    })
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
}

const read = async (req, res) => {
  try {
    const hotspots = await Hotspot.find().lean()
    await Promise.all(
      hotspots.map(async (hotspot) => {
        const imgSrc = await preSigner(hotspot.imgSrc ? [hotspot.imgSrc] : [])
        hotspot.imgSrc = imgSrc.length > 0 ? imgSrc[0] : ''
      })
    )
    return res.status(200).send({ hotspots })
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
}

module.exports = {
  add,
  read,
}
