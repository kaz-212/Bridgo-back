const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
  const { username, password } = req.body;
  // const hashedPassword = await bcrypt.hash(password, 12)

  const result = await bcrypt.compare(password, hashedPw);
});

module.exports = router;
