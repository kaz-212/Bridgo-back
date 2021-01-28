const express = require('express')
const router = express.Router({ mergeParams: true })

const inventory = require('./inventory.js')

// routes
router.use('/inventory', inventory)

module.exports = router
