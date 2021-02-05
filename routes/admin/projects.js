const express = require('express')
const router = express.Router()
const Project = require('../../models/Projects/projects')
const Theme = require('../../models/Projects/themes')
const multer = require('multer')
const { storage, cloudinary } = require('../../cloudinary')
const upload = multer({ storage })

// methods

// callback tto sort by ascending value of index
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

// routes

router.get('/theme', async (req, res) => {
  const themes = await Theme.find({}).populate('projects')
  const sortedThemes = sortMany(themes)
  res.json(sortedThemes)
})

router.post('/theme', async (req, res) => {
  const theme = new Theme(req.body)
  await theme.save()
  res.json(theme)
})

// create new project
router.post('/project', upload.array('imgs'), async (req, res) => {
  const project = JSON.parse(req.body.project)
  const newProject = new Project(project)

  for (let i = 0; i < req.files.length; i++) {
    let image = {}
    image.imgURL = req.files[i].path
    image.filename = req.files[i].filename
    image.index = i
    newProject.images.push(image)
  }
  await newProject.save()
  const theme = await Theme.findByIdAndUpdate(
    newProject.theme,
    { $push: { projects: newProject._id } },
    { new: true }
  ).populate('projects')
  const sortedTheme = sortOne(theme)
  res.json(sortedTheme)
})

router.put('/project', upload.array('imgs'), async (req, res) => {
  const project = JSON.parse(req.body.project)
  const filenames = JSON.parse(req.body.filenames)
  for (let i = 0; i < req.files.length; i++) {
    let image = {}
    image.imgURL = req.files[i].path
    image.filename = req.files[i].filename
    // find the index of last thing in project.images and increment it for each image
    image.index = project.images[project.images.length - 1].index + 1 + i
    project.images.push(image)
  }
  for (filename of filenames) {
    await cloudinary.uploader.destroy(filename)
  }
  const oldProject = await Project.findByIdAndUpdate(project._id, project) // returns pre-updated proj.
  if (oldProject.theme !== project.theme) {
    await Theme.findByIdAndUpdate(oldProject.theme, { $pull: { projects: project._id } })
    const theme = await Theme.findByIdAndUpdate(
      project.theme,
      { $push: { projects: project._id } },
      { new: true }
    ).populate('projects')
    const sortedTheme = sortOne(theme)
    res.json(sortedTheme)
  } else {
    const theme = await Theme.findById(project.theme).populate('projects')
    const sortedTheme = sortOne(theme)
    res.json(sortedTheme)
  }
})

// update the index ordering of projects in a theme
router.patch('/project', async (req, res) => {
  const projects = req.body
  for (const project of projects) {
    await Project.findByIdAndUpdate(project._id, { index: project.index })
  }
  const theme = await Theme.findById(projects[0].theme).populate('projects')
  const sortedTheme = sortOne(theme)
  res.json(sortedTheme)
})

module.exports = router
