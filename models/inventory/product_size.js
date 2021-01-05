const mongoose = require('mongoose')
const Schema = mongoose.Schema

const sizePriceQtySchema = new Schema({
  size: {
    type: Schema.Types.ObjectId,
    ref: 'Size',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  qty: {
    type: Number,
    required: true,
    min: 0
  }
})

const particularSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  size_price_qty: [sizePriceQtySchema]
})

module.exports = mongoose.model('Particular', particularSchema)
