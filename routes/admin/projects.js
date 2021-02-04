const express = require('express')
const router = express.Router()
const Project = require('../../models/Projects/projects')
const Theme = require('../../models/Projects/themes')
const multer = require('multer')
const { storage, cloudinary } = require('../../cloudinary')
const upload = multer({ storage })

// methods

// return the theme with projects ordered by index
const orderProjects = theme => {
  theme.projects.sort((a, b) => {
    return a.index - b.index
  })
  return theme
}

// routes

router.get('/theme', async (req, res) => {
  const themes = await Theme.find({}).populate('projects')
  for (let i = 0; i < themes.length; i++) {
    themes[i] = orderProjects(themes[i])
  }
  res.json(themes)
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
    if (i === 0) {
      image.isMain = true // default is false
    }
    newProject.images.push(image)
  }
  await newProject.save()
  const theme = await Theme.findByIdAndUpdate(
    newProject.theme,
    { $push: { projects: newProject._id } },
    { new: true }
  ).populate('projects')
  const orderedTheme = orderProjects(theme)
  res.json(orderedTheme)
})

router.put('/project', upload.array('imgs'), async (req, res) => {
  const project = JSON.parse(req.body.project)
  const filenames = JSON.parse(req.body.filenames)
  for (let i = 0; i < req.files.length; i++) {
    let image = {}
    image.imgURL = req.files[i].path
    image.filename = req.files[i].filename
    if (i === 0) {
      image.isMain = true // default is false
    }
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
    const orderedTheme = orderProjects(theme)
    res.json(orderedTheme)
  } else {
    const theme = await Theme.findById(project.theme).populate('projects')
    const orderedTheme = orderProjects(theme)
    res.json(orderedTheme)
  }
})

// update the index ordering of projects in a theme
router.patch('/project', async (req, res) => {
  const projects = req.body
  for (const project of projects) {
    await Project.findByIdAndUpdate(project._id, { index: project.index })
  }
  const theme = await Theme.findById(projects[0].theme).populate('projects')
  const orderedTheme = orderProjects(theme)
  res.json(orderedTheme)
})

module.exports = router
