let secure
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
  secure = false
} else {
  secure = true
}
const express = require('express')
const app = express()

const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const morgan = require('morgan')
const history = require('connect-history-api-fallback')
const session = require('express-session')
const MongoStore = require('connect-mongo').default

const admin = require('./routes/admin')
const project = require('./routes/projects.js')
const exhibition = require('./routes/exhibitions.js')
const inventory = require('./routes/inventory.js')
const payment = require('./routes/payment.js')

// ======== MONGOOSE ========

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

// ======== MIDDLEWARE ========
// cors
const corsOpts = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  exposedHeaders: ['set-cookie']
}
app.use(cors(corsOpts))

// cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET_KEY))

// express-session

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60
})

store.on('error', e => {
  console.log('SESSION STORE ERROR', e)
})

const sessionConfig = {
  store,
  name: 'order',
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true, // TODO same site
    maxAge: 1000 * 60 * 60 * 7, // 7 hrs
    secure
  }
}

app.use(session(sessionConfig))

// other middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(history())
app.use(morgan('dev'))

// ======== ROUTES ========
app.use('/api/admin', admin)
app.use('/api/projects', project)
app.use('/api/exhibitions', exhibition)
app.use('/api/inventory', inventory)
app.use('/api/payment-intent', payment)

// ======== ERROR ========
app.use((err, req, res, next) => {
  const { status = 500, message = 'Something went wrong' } = err
  res.status(status).send(message)
})

// Handle production
if (process.env.NODE_ENV === 'production') {
  // set the static folder
  app.use(express.static(__dirname + '/public'))

  // handle SPA
  app.get(/.*/, (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
  })
}

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`'ERE ME NOW ON ${port}`)
})
