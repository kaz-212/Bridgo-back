if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const history = require('connect-history-api-fallback')

const project = require('./routes/projects.js')
const exhibition = require('./routes/exhibitions.js')

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
app.use(express.json())
app.use(cors())
app.use(history())
app.use(morgan('dev'))

// routes
app.use('/api/projects', project)
app.use('/api/exhibitions', exhibition)

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`'ERE ME NOW ON ${port}`)
})
