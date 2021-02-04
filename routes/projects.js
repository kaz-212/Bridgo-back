const express = require('express')
const router = express.Router()
const Theme = require('../models/Projects/themes')

const orderProjects = theme => {
  theme.projects.sort((a, b) => {
    return a.index - b.index
  })
  return theme
}

router.get('/', async (req, res) => {
  const themes = await Theme.find().populate('projects')
  // order projects and only keep them in if it has the onShow attribute
  for (let i = 0; i < themes.length; i++) {
    themes[i] = orderProjects(themes[i])
    themes[i].projects = themes[i].projects.filter(project => project.onShow === true)
  }
  res.json(themes)
})

module.exports = router
