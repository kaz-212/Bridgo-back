const express = require('express')
const router = express.Router()
const Particular = require('../models/inventory/product_size')
const stripe = require('stripe')(process.env.STRIPE_SECRET)

const calculatePrice = async items => {
    // calculate price based on particular id and quantity
    let total = 0
    for (const item of items) {
        let price = undefined
        const particular = await Particular.findById(item.particular._id)
        for (const info of particular.size_price_qty) {
            if (info._id == item.info._id) {
                price = info.price
            }
        }
        total += Math.floor(item.qty * price * 100)
    }
    return total
}

router.post('/', async (req, res) => {
    const { items } = req.body
    const amount = await calculatePrice(items)

    if (req.cookies.intent) {
        const oldIntent = JSON.parse(req.cookies.intent)
        const intent = await stripe.paymentIntents.retrieve(oldIntent.client_secret)
        console.log(intent)
    } else {
        // TODO if price == NAN => throw an error
        const intent = await stripe.paymentIntents.create({
            amount,
            currency: 'gbp'
        })
        res.json({ client_secret: intent.client_secret, amount, id: intent.id })
    }
})

module.exports = router
