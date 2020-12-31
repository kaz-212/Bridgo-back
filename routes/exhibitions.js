const express = require('express')
const router = express.Router()
const Exhibition = require('../models/exhibitions')
const multer = require('multer')
const { storage, cloudinary } = require('../cloudinary')
const upload = multer({ storage })

router.get('/', async (req, res) => {
  // console.log('geto')
  const exhibitions = await Exhibition.find({}).sort({ index: 1 })
  res.status(200).json(exhibitions)
})

router.post('/', upload.array('imgs'), async (req, res) => {
  const exhibition = JSON.parse(req.body.exhibition)
  console.log('yoyo', exhibition)
  const index = await Exhibition.countDocuments()
  exhibition.index = index
  const newExhibition = new Exhibition(exhibition)
  for (const img of req.files) {
    let image = {}
    image.imgURL = img.path
    image.filename = img.filename
    newExhibition.images.push(image)
  }
  console.log(newExhibition)
  const completed = await newExhibition.save()

  res.status(200).json(completed)
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params
  const exhibition = await Exhibition.findByIdAndDelete(id)
  console.log(exhibition.images)
  for (const img of exhibition.images) {
    await cloudinary.uploader.destroy(img.filename)
  }
  res.status(200).json(exhibition)
})

// need to sort out deleting images

router.put('/:id', upload.array('imgs'), async (req, res) => {
  const { id } = req.params
  const exhibition = JSON.parse(req.body.exhibition)
  for (const img of req.files) {
    let image = {}
    image.imgURL = img.path
    image.filename = img.filename
    exhibition.images.push(image)
  }
  const editedExhibition = await Exhibition.findByIdAndUpdate(id, exhibition, { new: true })
  const filenames = JSON.parse(req.body.filenames)
  for (const img of filenames) {
    console.log(img)
    await cloudinary.uploader.destroy(img)
  }
  res.status(200).json(editedExhibition)
})

module.exports = router
