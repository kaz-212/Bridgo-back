const mongoose = require('mongoose')
const Schema = mongoose.Schema

const opts = { toJSON: { virtuals: true } }

const imageSchema = new Schema(
  {
    imgURL: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      unique: true,
      required: true
    }
  },
  opts
)

imageSchema.virtual('thumbnail').get(function () {
  return this.imgURL.replace('/upload', '/upload/w_200')
})

const exhibitionSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: String
  },
  location: {
    type: String
  },
  isUpcoming: {
    type: Boolean,
    default: true
  },
  onShow: {
    type: Boolean,
    default: true
  },
  index: {
    type: Number,
    unique: true,
    required: true
  },
  links: [
    {
      name: String,
      URL: String
    }
  ],
  images: [imageSchema]
})

module.exports = mongoose.model('Exhibition', exhibitionSchema)
