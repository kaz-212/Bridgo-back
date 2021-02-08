const express = require('express')
const router = express.Router()
const Exhibition = require('../models/exhibitions')

router.get('/', async (req, res) => {
  // console.log('geto')
  const exhibitions = await Exhibition.find({}).sort({ index: 1 })
  res.status(200).json(exhibitions)
})

module.exports = router
