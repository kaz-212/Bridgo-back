const express = require('express')
const router = express.Router()
const Project = require('../../models/Projects/projects')
const Theme = require('../../models/Projects/themes')
const multer = require('multer')
const { storage, cloudinary } = require('../../cloudinary')
const upload = multer({ storage })

router.post('/theme', async (req, res) => {
  const theme = await new Theme(req.body)
  await theme.save()
  res.json(theme)
})

module.exports = router
