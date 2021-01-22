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
    // TODO create a function that checks qty available and throw err if not.

    // if we already have a payment intent created, update the amount of the old one every time checkout page loads
    if (req.cookies.intent) {
        const oldIntent = JSON.parse(req.cookies.intent)
        // regex searching until second '_' gives us id
        const re = /[^_]*_[^_]*/
        const id = re.exec(oldIntent.client_secret)
        const intent = await stripe.paymentIntents.update(id[0], {
            amount
        })
        console.log(intent)
        res.send(intent)
    } else {
        // TODO if price == NAN => throw an error
        const intent = await stripe.paymentIntents.create({
            amount,
            currency: 'gbp'
        })
        console.log(intent)
        res.json({ client_secret: intent.client_secret, amount })
    }
})

module.exports = router
