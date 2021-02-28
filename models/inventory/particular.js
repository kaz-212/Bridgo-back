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
    required: [true, 'Need to add a size']
  },
  price: {
    type: Number,
    required: [true, 'Need to add a price']
  },
  shippingCost: {
    type: Number,
    required: [true, 'Please add the cost of shipping']
  },
  unitsRemaining: {
    type: Number,
    required: [true, 'Please add a quantity'],
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
