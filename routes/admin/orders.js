const express = require('express')
const router = express.Router()

const Order = require('../../models/inventory/orders')

router.get('/', async (req, res) => {
  const orders = await Order.find({}).populate({
    path: 'items',
    select: 'particular'
  })
  res.json(orders)
})

module.exports = router
