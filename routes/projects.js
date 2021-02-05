const express = require('express')
const router = express.Router()
const Theme = require('../models/Projects/themes')

const sortAssending = (a, b) => {
  return a.index - b.index
}

// sort the projects and images for one theme by index
const sortOne = theme => {
  theme.projects.sort(sortAssending)
  for (let i = 0; i < theme.projects.length; i++) {
    theme.projects[i].images.sort(sortAssending)
  }
  return theme
}

// sort the projects and images for many themes by index
const sortMany = themes => {
  for (let i = 0; i < themes.length; i++) {
    sortOne(themes[i])
  }
  return themes
}

router.get('/', async (req, res) => {
  const themes = await Theme.find().populate('projects')
  // order projects, only keep them in if it has onShow attribute, order images in each project
  for (let i = 0; i < themes.length; i++) {
    themes[i].projects = themes[i].projects.filter(project => project.onShow === true)
  }
  const sortedThemes = sortMany(themes)
  res.json(sortedThemes)
})

module.exports = router
