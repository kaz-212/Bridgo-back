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
  for (let img of req.files) {
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
  for (img of exhibition.images) {
    await cloudinary.uploader.destroy(img.filename)
  }
  res.status(200).json(exhibition)
})

router.put('/:id', upload.array('imgs'), async (req, res) => {
  const { id } = req.params
  const exhibition = JSON.parse(req.body.exhibition)
  const filenames = JSON.parse(req.body.filenames)
  for (const img of req.files) {
    let image = {}
    image.imgURL = img.path
    image.filename = img.filename
    exhibition.images.push(image)
  }
  const editedExhibition = await Exhibition.findByIdAndUpdate(id, exhibition, { new: true })
  for (const img of filenames) {
    await cloudinary.uploader.destroy(img)
  }
  console.log(editedExhibition)
  // res.status(200).json(editedExhibition)
})

module.exports = router
