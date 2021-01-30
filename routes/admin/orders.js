const express = require('express')
const router = express.Router()

const Order = require('../../models/inventory/orders')

router.get('/', async (req, res) => {
  const orders = await Order.find({}).populate({
    path: 'items',
    populate: [
      {
        path: 'particular',
        populate: [{ path: 'size', select: 'name' }, { path: 'product' }]
      }
    ]
  })
  console.log(orders[0].items)
  res.json(orders)
})

module.exports = router
