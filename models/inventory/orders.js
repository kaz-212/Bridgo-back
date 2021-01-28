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
  trackingNumber: {
    type: String
  },
  otherDetails: {
    type: String
  },
  returned: {
    isReturned: {
      type: Boolean,
      default: false
    },
    details: {
      type: String
    }
  },
  items: [
    {
      particular: {
        type: Schema.Types.ObjectId,
        ref: 'Particular'
      },
      qty: {
        type: Number
      }
    }
  ]
})

module.exports = mongoose.model('Order', orderSchema)
