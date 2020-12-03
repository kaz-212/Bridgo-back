const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProjectPieceSchema = new Schema({
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
    // required: true
  },
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
  year: {
    type: Number,
    required: true
  },
  index: {
    type: Number,
    unique: true
  }
})

module.exports = mongoose.model('ProjectPiece', ProjectPieceSchema)
