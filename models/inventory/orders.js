const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  address: {
    line1: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    postCode: {
      type: String,
      required: true
    }
  },
  name: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    }
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
    type: Boolean,
    default: false
  }
})

module.exports = mongoose.model('Order', orderSchema)
