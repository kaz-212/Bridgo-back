const express = require('express')
const router = express.Router()
const Exhibition = require('../models/exhibitions')

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

router.get('/', async (req, res) => {
  const exhibitions = await Exhibition.find({ onShow: true }).sort({ index: -1 })
  const sortedExhibitions = sortMany(exhibitions)
  res.status(200).json(sortedExhibitions)
})

module.exports = router
