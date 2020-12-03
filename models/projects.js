const mongoose = require('mongoose')
const Schema = mongoose.Schema

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
  pieces: [
    {
      type: Schema.Types.ObjectId,
      ref: 'ProjectPiece'
      // required: true
    }
  ]
})

module.exports = mongoose.model('Project', ProjectSchema)
