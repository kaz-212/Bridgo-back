const mongoose = require('mongoose')
const Schema = mongoose.Schema

const opts = { toJSON: { virtuals: true } }

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
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  unitsSold: {
    type: Number,
    required: true,
    default: 0
  }
})
//  VIRTULAL OF SUM OF ALL QUANTITY
const particularSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    size_price_qty: [sizePriceQtySchema]
  },
  opts
)

particularSchema.virtual('totalRemaining').get(function () {
  let total = 0
  for (const size of this.size_price_qty) {
    total += size.qty
  }
  return total
})

particularSchema.virtual('totalSold').get(function () {
  let total = 0
  for (const size of this.size_price_qty) {
    total += size.unitsSold
  }
  return total
})

module.exports = mongoose.model('Particular', particularSchema)
