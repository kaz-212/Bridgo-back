const mongoose = require('mongoose')
const Schema = mongoose.Schema

// each Particular is one size of a product and stored in an array in the product schema
const particularSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  size: {
    type: Schema.Types.ObjectId,
    ref: 'Size',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  shippingCost: {
    international: {
      type: Number,
      required: true
    },
    local: {
      type: Number,
      required: true
    }
  },
  unitsRemaining: {
    type: Number,
    required: true,
    min: 0
  },
  index: {
    type: Number
    // required: true,
    // default: 0
  },
  unitsSold: {
    type: Number,
    required: true,
    default: 0
  }
})

module.exports = mongoose.model('Particular', particularSchema)
