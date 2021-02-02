const mongoose = require('mongoose')
const Schema = mongoose.Schema

const themeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  years: String,
  projects: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  }
})

module.exports = mongoose.model('Theme', themeSchema)
