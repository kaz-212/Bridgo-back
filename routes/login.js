const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');

const catchAsync = require('../utilities/catchAsync.js');
const ExpressError = require('../utilities/ExpressError');

const login = async (req, res, next) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user) {
    const result = await bcrypt.compare(password, user.password);
    if (result) {
      return next();
    }
  }
  throw new ExpressError('Incorrect username or password', 401);
};

router.post('/', catchAsync(login), (req, res) => {
  const { username } = req.body;
  const user = { name: username };
  const token = jwt.sign(user, process.env.TOKEN_SECRET);
  res.json({ accessToken: token });
});

module.exports = router;
