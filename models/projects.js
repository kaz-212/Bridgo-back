const mongoose = require('mongoose')
const Schema = mongoose.Schema

const pieceSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  isMain: {
    type: Boolean,
    required: true
  },
  imgURL: {
    type: String,
    required: true
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
    type: Number,
    required: true,
    unique: true
  },
  showInProj: {
    type: Boolean,
    default: true
  },
  filename: {
    type: String,
    unique: true
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
