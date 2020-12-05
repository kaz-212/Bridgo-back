const mongoose = require('mongoose')
const Schema = mongoose.Schema

const pieceSchema = new Schema({
  isMain: {
    type: Boolean,
    required: true
  },
  imgURL: {
    type: String,
    required: true,
    filename: String
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: false
  },
  size: {
    type: String,
    required: true
  },
  materials: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  index: {
    type: Number
  },
  onShow: {
    type: Boolean,
    default: true
  }
})

const ProjectSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  index: {
    type: Number,
    unique: true
  },
  onShow: {
    type: Boolean,
    default: true
  },
  pieces: [pieceSchema]
})

module.exports = mongoose.model('Project', ProjectSchema)
