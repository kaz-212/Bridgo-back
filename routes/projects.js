const express = require('express')
const router = express.Router()
const Project = require('../models/projects')
const Piece = require('../models/pieces')

router.get('/', (req, res) => {
  console.log(req.body)
  Project.find()
    .sort({ index: 1 })
    .then(projects => res.json(projects))
})

router.post('/', async (req, res) => {
  const { name, description, year, index } = req.body
  const project = new Project({
    name,
    description,
    year,
    index
  })
  await project.save()
  console.log('Success')
  res.json(project)
})

module.exports = router
