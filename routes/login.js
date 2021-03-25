const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user.js');

const catchAsync = require('../utilities/catchAsync.js');
const ExpressError = require('../utilities/ExpressError');

router.post(
  '/',
  catchAsync(async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user) {
      const result = await bcrypt.compare(password, user.password);
      if (result) {
        return res.send('SUCCESS');
      }
    }
    throw new ExpressError('Incorrect username or password', 401);
  })
);

module.exports = router;
