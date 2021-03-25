let cookieSecure;
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
  cookieSecure = false;
} else {
  cookieSecure = true;
}
const express = require('express');
const app = express();

const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const history = require('connect-history-api-fallback');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;

const admin = require('./routes/admin');
const project = require('./routes/projects.js');
const exhibition = require('./routes/exhibitions.js');
const inventory = require('./routes/inventory.js');
const payment = require('./routes/payment.js');
const login = require('./routes/login.js');

// ======== Create new user ========

// const User = require('./models/user.js');
// const bcrypt = require('bcrypt');

// const newUser = async (username, password) => {
//   const hashedPassword = await bcrypt.hash(password, 12);
//   const user = new User({ username, password: hashedPassword });
//   await user.save();
//   console.log('SUCCESS');
// };

// newUser('test', 'test');

// ======== MONGOOSE ========

const dbUrl = process.env.MONGO_URL;

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

// ======== MIDDLEWARE ========

// cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET_KEY));

// express-session

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60
});

store.on('error', e => {
  console.log('SESSION STORE ERROR', e);
});

const sessionConfig = {
  store,
  name: 'order',
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true, // TODO same site
    maxAge: 1000 * 60 * 60 * 7, // 7 hrs
    cookieSecure
  }
};

app.use(session(sessionConfig));

// Https if live, cors if in dev mode

if (process.env.NODE_ENV === 'production') {
  app.use(function (req, res, next) {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      return next();
    } else {
      return res.redirect('https://' + req.headers.host + req.url);
    }
  });
} else {
  const cors = require('cors');
  const corsOpts = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    exposedHeaders: ['set-cookie']
  };
  app.use(cors(corsOpts));
}

// other middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(history());
app.use(morgan('dev'));

// ======== ROUTES ========

app.use('/api/admin', admin);
app.use('/api/projects', project);
app.use('/api/exhibitions', exhibition);
app.use('/api/inventory', inventory);
app.use('/api/payment-intent', payment);
app.use('/api/login', login);

// ======== ERROR ========
app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'Something went wrong' } = err;
  res.status(statusCode).send(message);
});

// Handle production
if (process.env.NODE_ENV === 'production') {
  // set the static folder
  app.use(express.static(__dirname + '/public'));

  // handle SPA
  app.get(/.*/, (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
  });
}

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`'ERE ME NOW ON ${port}`);
});
