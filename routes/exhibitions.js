const express = require('express')
const router = express.Router()
const Exhibition = require('../models/exhibitions')
const multer = require('multer')
const { storage, cloudinary } = require('../cloudinary')
const upload = multer({ storage })

router.get('/', (req, res) => {})

router.post('/', upload.array('imgs'), async (req, res) => {
  const exhibition = JSON.parse(req.body.exhibition)
  // console.log(req.files)
  const index = await Exhibition.countDocuments()
  exhibition.index = index
  const newExhibition = new Exhibition(exhibition)
  for (let img of req.files) {
    let image = {}
    image.imgURL = img.path
    image.filename = img.filename
    newExhibition.images.push(image)
  }
  console.log(newExhibition)
  const completed = await newExhibition.save()

  // console.log(newExhibition)
  res.status(200).json(completed)
})

module.exports = router
