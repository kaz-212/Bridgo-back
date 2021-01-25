const mongoose = require('mongoose')
const Schema = mongoose.Schema

const sizeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }
  ]
})

module.exports = mongoose.model('Size', sizeSchema)
