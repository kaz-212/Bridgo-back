const express = require('express')
const router = express.Router()
const stripe = require('stripe')(process.env.STRIPE_SECRET)
const { v4: uuidv4 } = require('uuid')

const Order = require('../models/inventory/orders')
const Particular = require('../models/inventory/particular')

const calculatePrice = async items => {
  // calculate price based on particular id and quantity
  let total = 0
  for (const item of items) {
    const particular = await Particular.findById(item.particular._id).populate('product')
    total += Math.floor(particular.price * item.qty * 100)
    if (item.qty > particular.unitsRemaining) {
      return { name: item.product.name, size: item.particular.size, remaining: particular.unitsRemaining }
    }
  }
  return total
}

router.post('/', async (req, res) => {
  const { items } = req.body
  const amount = await calculatePrice(items)
  req.session.items = items
  req.session.amount = amount
  if (typeof amount != 'object') {
    // if we already have a payment intent created, update the amount of the old one every time checkout page loads
    if (req.cookies.intent) {
      const oldIntent = JSON.parse(req.cookies.intent)
      // regex searching until second '_' gives us id
      const re = /[^_]*_[^_]*/
      const id = re.exec(oldIntent.client_secret)
      const intent = await stripe.paymentIntents.update(id[0], {
        amount
      })
      // console.log(intent)
      res.json({ client_secret: intent.client_secret, amount })
    } else {
      // TODO if price == NAN => throw an error
      const orderId = uuidv4()
      const intent = await stripe.paymentIntents.create({
        amount,
        currency: 'gbp',
        metadata: {
          orderId
        }
      })
      // console.log(intent)
      res.json({ client_secret: intent.client_secret, amount })
    }
  } else {
    res.json({ issue: amount })
  }
})

router.post('/process', async (req, res) => {
  console.log(req.session)
  const { receipt_email: email } = req.body
  const intent = await stripe.paymentIntents.retrieve(req.body.id)
  // create order based on details from paymentId
  const order = new Order({
    email: email,
    orderId: intent.metadata.orderId
  })
  // console.log(req.session)

  for (const item of req.session.items) {
    // update the value remainingvalue sold
    const particular = await Particular.findByIdAndUpdate(
      item.particular._id,
      { $inc: { unitsRemaining: -item.qty, unitsSold: item.qty } },
      { new: true }
    )
    const orderItem = {
      particular: particular._id,
      qty: item.qty
    }
    order.items.push(orderItem)
  }
  await order.save()
  // delete session and remove on client side
  req.session.destroy(err => {
    if (err) {
      console.log('ERROR', err)
    } else {
      req.session = null
      res.clearCookie('order', { path: '/' })
      return res.send('success')
    }
  })
})

module.exports = router
