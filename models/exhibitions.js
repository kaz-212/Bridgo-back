const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ImageSchema = new Schema({
  imgURL: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    unique: true,
    required: true
  }
})

const ExhibitionSchema = new Schema({
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
  images: [ImageSchema]
})

module.exports = mongoose.model('Exhibition', ExhibitionSchema)
