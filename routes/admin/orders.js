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
  res.json(orders)
})

router.put('/dispatch/:id', async (req, res) => {
  const { id } = req.params
  const order = await Order.findByIdAndUpdate(id, { dispatched: true }, { new: true })
  res.json(order)
})

module.exports = router
