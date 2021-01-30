const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  dispatched: {
    type: Boolean,
    default: false
  },
  amount: {
    type: Number,
    required: true
  },
  otherDetails: {
    type: String
  },
  items: [
    {
      name: {
        type: String
      },
      qty: {
        type: Number
      },
      size: {
        type: String
      }
    }
  ]
})

module.exports = mongoose.model('Order', orderSchema)
