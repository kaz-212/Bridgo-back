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

// toggle value of dispatched
router.put('/dispatch/:id', async (req, res) => {
  const { id } = req.params
  await Order.findById(id, async function (err, doc) {
    if (err) {
      console.log(err)
    }
    doc.dispatched = !doc.dispatched
    const order = await doc.save()
    res.json(order)
  })
})

module.exports = router
