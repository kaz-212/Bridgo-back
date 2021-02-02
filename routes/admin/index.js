const express = require('express')
const router = express.Router({ mergeParams: true })

const inventory = require('./inventory.js')
const orders = require('./orders.js')
const projects = require('./projects.js')

// routes
router.use('/inventory', inventory)
router.use('/orders', orders)
router.use('/projects', projects)

module.exports = router
