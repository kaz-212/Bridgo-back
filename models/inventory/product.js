const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Particular = require('./particular')

const opts = { toJSON: { virtuals: true } }

const imgSchema = new Schema(
  {
    imgURL: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      // unique: true,
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
    required: [true, 'Name field cannot be blank'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Need to add a descriptopn']
  },
  images: [imgSchema],
  type: {
    type: String,
    enum: ['print', 'piece', 'other'],
    required: [true, 'Need to select a type pls']
  },
  onShow: {
    type: Boolean,
    default: true
  },
  index: {
    type: Number
    // required: true
  },
  particulars: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Particular'
    }
  ]
})

module.exports = mongoose.model('Product', productSchema)
