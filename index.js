if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const ProjectPiece = require('./models/pieces')
const Project = require('./models/projects')

const project = require('./routes/projects.js')

// mongoose

const dbUrl = process.env.MONGO_URL

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  console.log('Database connected')
})

// middleware
app.use(express.urlencoded({ extended: true }))

// routes
app.use('/api/projects', project)

// const makePiece = async () => {
//   const piece = new ProjectPiece({
//     // project: 'hello',
//     description: 'good pic',
//     isMain: true,
//     imgURL: 'www.hello',
//     price: 300,
//     size: '20 x 20',
//     year: 1984
//   })
//   await piece.save()
// }

// makePiece()

// const makeProj = async () => {
//   const proj = new Project({
//     name: 'hello',
//     description: 'good pic',
//     year: 1984,
//     index: 0
//   })
//   await proj.save()
//   console.log(proj)
// }

// makeProj()

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`'ERE ME NOW ON ${port}`)
})
