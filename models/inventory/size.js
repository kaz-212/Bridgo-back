const mongoose = require('mongoose')
const Schema = mongoose.Schema

const sizeSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Need to add a size name']
  },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }
  ]
})

module.exports = mongoose.model('Size', sizeSchema)
