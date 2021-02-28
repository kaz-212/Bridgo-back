const mongoose = require('mongoose')
const Schema = mongoose.Schema

const opts = { toJSON: { virtuals: true } }

const imgSchema = new Schema(
  {
    imgURL: {
      type: String,
      required: true
    },
    index: {
      type: Number
    },
    filename: {
      type: String,
      unique: true
    }
  },
  opts
)

imgSchema.virtual('thumbnail').get(function () {
  return this.imgURL.replace('/upload', '/upload/w_250')
})

const projectSchema = new Schema({
  name: {
    type: String,
    required: [true, "You're gonna need a name for this one"]
  },
  description: {
    type: String,
    required: [true, 'You need to add a description']
  },
  year: {
    type: String,
    required: [true, 'You need to add a Year']
  },
  materials: {
    type: String,
    required: [true, 'You need to say what materials you used']
  },
  index: {
    type: Number
  },
  onShow: {
    type: Boolean,
    default: true
  },
  images: [imgSchema],
  theme: {
    type: Schema.Types.ObjectId,
    ref: 'Theme'
  }
})

module.exports = mongoose.model('Project', projectSchema)
