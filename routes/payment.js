const express = require('express')
const router = express.Router()
const stripe = require('stripe')(process.env.STRIPE_SECRET)
const uuid = require('short-uuid')

const Order = require('../models/inventory/orders')
const Particular = require('../models/inventory/particular')

const calculatePrice = async items => {
  // calculate price based on particular id and quantity
  let total = 0
  for (const item of items) {
    const particular = await Particular.findById(item.particular._id).populate('product')
    total += Math.floor(particular.price * item.qty * 100)
    if (item.qty > particular.unitsRemaining) {
      // if they have requested to buy more than is in stock, return an object rather than integer
      return { name: item.product.name, size: item.particular.size, remaining: particular.unitsRemaining }
    }
  }
  return total
}

// post('/') gets called when checkout page loads
// when 'pay now' clicked, post('/') gets called again (to make sure client hasnt changed info). Items and amount saved.
// then payment processed client side. If successful calls post('/process')

router.post('/', async (req, res) => {
  const { items } = req.body
  const amount = await calculatePrice(items)
  // save info about items in server side when payment is clicked so it cant be changed client side
  req.session.items = items
  req.session.amount = amount
  // if there are enough left in stock
  if (typeof amount != 'object') {
    if (req.cookies.intent) {
      // if we already have a payment intent created, update the amount of the old one every time checkout page loads
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
      // first time payment intent created, assign it a unique order number
      const orderId = uuid.generate()
      const intent = await stripe.paymentIntents.create({
        amount,
        currency: 'gbp',
        metadata: {
          orderId
        }
      })
      res.json({ client_secret: intent.client_secret, amount })
    }
  } else {
    res.json({ issue: amount })
  }
})

// creates an order and adds items saved in the session to the order so know which items to send

router.post('/process', async (req, res) => {
  console.log(req.session)
  const { receipt_email: email } = req.body
  const intent = await stripe.paymentIntents.retrieve(req.body.id)
  // create order based on details from paymentId
  const order = new Order({
    email: email,
    orderId: intent.metadata.orderId
  })

  for (const item of req.session.items) {
    // update the values unitsRemaining and unitsSold
    const particular = await Particular.findByIdAndUpdate(
      item.particular._id,
      { $inc: { unitsRemaining: -item.qty, unitsSold: item.qty } },
      { new: true }
    ).populate('product size')
    const orderItem = {
      qty: item.qty,
      name: particular.product.name,
      size: particular.size.name
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
