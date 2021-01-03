const mongoose = require('mongoose')
const Schema = mongoose.Schema
const 

const particularSchema = new Schema({
  size: {
    type: String,
    required: true
  },
  qty: {
    type: Number,
    required: true,
    min: 0 
  },
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required:true
  },
  size_id: {
    type: Schema.Types.ObjectId,
    ref: 'Size',
    required:true
  },
  price: {
    type: Number,
    required:true
  }
})

module.exports = mongoose.model('Particular', particularSchema)
