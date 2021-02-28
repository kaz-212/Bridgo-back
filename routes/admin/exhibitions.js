const express = require('express')
const router = express.Router()
const Exhibition = require('../../models/exhibitions')
const multer = require('multer')
const { storage, cloudinary } = require('../../cloudinary')
const upload = multer({ storage })

// error handling middleware
const catchAsync = require('../../utilities/catchAsync')
const ExpressError = require('../../utilities/ExpressError')

// methods

// callback tto sort by ascending value of index
const sortAscending = (a, b) => {
  return a.index - b.index
}

// sort the projects and images for one theme by index
const sortOne = exhibition => {
  exhibition.images.sort(sortAscending)
  return exhibition
}

const sortMany = exhibitions => {
  for (let i = 0; i < exhibitions.length; i++) {
    sortOne(exhibitions[i])
  }
  return exhibitions
}

// routes
router.get(
  '/',
  catchAsync(async (req, res) => {
    const exhibitions = await Exhibition.find({}).sort({ index: -1 })
    const sortedExhibitions = sortMany(exhibitions)
    res.status(200).json(sortedExhibitions)
  })
)

router.post(
  '/',
  upload.array('imgs'),
  catchAsync(async (req, res) => {
    const exhibition = JSON.parse(req.body.exhibition)
    console.log('yoyo', exhibition)
    const index = await Exhibition.countDocuments()
    exhibition.index = index
    const newExhibition = new Exhibition(exhibition)
    for (const img of req.files) {
      let image = {}
      image.imgURL = img.path.replace('/upload', '/upload/w_auto,q_auto')
      image.filename = img.filename
      newExhibition.images.push(image)
    }
    console.log(newExhibition)
    const completed = await newExhibition.save()

    res.status(200).json(completed)
  })
)

router.delete(
  '/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params
    const exhibition = await Exhibition.findByIdAndDelete(id)
    console.log(exhibition.images)
    for (const img of exhibition.images) {
      await cloudinary.uploader.destroy(img.filename)
    }
    res.status(200).json(exhibition)
  })
)

// need to sort out deleting images

router.put(
  '/:id',
  upload.array('imgs'),
  catchAsync(async (req, res) => {
    const { id } = req.params
    const exhibition = JSON.parse(req.body.exhibition)
    for (const img of req.files) {
      let image = {}
      image.imgURL = img.path.replace('/upload', '/upload/w_auto,q_auto')
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
)

router.patch(
  '/order',
  catchAsync(async (req, res) => {
    const exhibitions = req.body
    for (const exhibition of exhibitions) {
      await Exhibition.findByIdAndUpdate(exhibition._id, { index: exhibition.index })
    }
    const updatedExhibitions = await Exhibition.find({}).sort({ index: -1 })
    const sortedExhibitions = sortMany(updatedExhibitions)
    res.json(sortedExhibitions)
  })
)

module.exports = router
