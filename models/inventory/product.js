const mongoose = require('mongoose')
const Schema = mongoose.Schema

const opts = { toJSON: { virtuals: true } }

const imgSchema = new Schema(
  {
    imgURL: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      unique: true,
      required: true
    },
    isMain: {
      required: true,
      default: false,
      type: Boolean
    }
  },
  opts
)

imgSchema.virtual('thumbnail').get(function () {
  return this.imgURL.replace('/upload', '/upload/w_250')
})

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  images: [imgSchema],
  type: {
    type: String,
    enum: ['print', 'piece', 'other'],
    required: true
  }
})

module.exports = mongoose.model('Product', productSchema)
