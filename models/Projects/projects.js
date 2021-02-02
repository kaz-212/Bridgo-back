const mongoose = require('mongoose')
const Schema = mongoose.Schema

const opts = { toJSON: { virtuals: true } }

const imgSchema = new Schema(
  {
    isMain: {
      type: Boolean,
      required: true
    },
    imgURL: {
      type: String,
      required: true
    },
    // index: {
    //   type: Number,
    //   required: true,
    //   unique: true
    // },
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
  materials: {
    type: String,
    required: true
  },
  // index: {
  //   type: Number,
  //   unique: true
  // },
  onShow: {
    type: Boolean,
    default: true
  },
  images: [imgSchema]
})

module.exports = mongoose.model('Project', projectSchema)