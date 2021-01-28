const express = require('express')
const router = express.Router()
const Particular = require('../models/inventory/particular')
const stripe = require('stripe')(process.env.STRIPE_SECRET)

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
  if (!req.session.views) {
    req.session.views = 1
  } else {
    req.session.views++
  }
  console.log(req.session)
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
      const intent = await stripe.paymentIntents.create({
        amount,
        currency: 'gbp'
      })
      // console.log(intent)
      res.json({ client_secret: intent.client_secret, amount })
    }
  } else {
    res.json({ issue: amount })
  }
})

module.exports = router
