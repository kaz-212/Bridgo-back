const express = require('express')
const router = express.Router()
const Project = require('../models/projects')
const multer = require('multer')
const { storage, cloudinary } = require('../cloudinary')
const upload = multer({ storage })

router.get('/', (req, res) => {
  Project.find({})
    .sort({ index: 1 })
    .then(projects => res.json(projects))
})

router.post('/', upload.array('imgs'), async (req, res) => {
  const project = JSON.parse(req.body.project)
  const pieces = JSON.parse(req.body.pieces)
  console.log(req.files)
  const { name, description, year, onShow } = project
  const position = await Project.countDocuments()
  const newProject = new Project({
    name,
    description,
    year,
    index: position,
    onShow
  })
  for (piece of pieces) {
    const { pieceName, isMain, pieceDescription, price, size, pieceYear, materials, showInProj, index } = piece
    let pieceIndex = parseInt(position.toString() + index.toString())
    let imgURL, filename
    for (i of req.files) {
      if (i.originalname === pieceName) {
        imgURL = i.path
        filename = i.filename
      }
    }
    const newPiece = {
      name: pieceName,
      project,
      isMain,
      description: pieceDescription,
      price,
      size,
      materials,
      year: pieceYear,
      index: pieceIndex,
      showInProj,
      imgURL,
      filename
    }
    newProject.pieces.push(newPiece)
  }
  console.log(newProject)
  await newProject.save()
  res.status(200).json(newProject)
})

// for editing entire project
router.put('/:id', async (req, res) => {
  console.log(req.body)
  const { id } = req.params
  const { project, filenames } = req.body
  const updatedProject = await Project.findByIdAndUpdate(id, project, { new: true })
  for (filename of filenames) {
    await cloudinary.uploader.destroy(filename)
  }
  res.status(200).json(updatedProject)
})

//  for adding a piece to project
router.patch('/:id', upload.single('img'), async (req, res) => {
  const { id } = req.params
  const piece = JSON.parse(req.body.piece)
  const project = await Project.findById(id)
  const { pieceName, isMain, pieceDescription, price, size, pieceYear, materials, showInProj, index } = piece
  let pieceIndex = parseInt(project.index.toString() + index.toString())
  const imgURL = req.file.path
  const filename = req.file.filename
  const newPiece = {
    name: pieceName,
    project,
    isMain,
    description: pieceDescription,
    price,
    size,
    materials,
    year: pieceYear,
    index: pieceIndex,
    showInProj,
    imgURL,
    filename
  }
  project.pieces.push(newPiece)
  await project.save()
  console.log(project)
  res.status(200).json(newPiece)
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params
  const project = await Project.findByIdAndDelete(id)
  for (piece of project.pieces) {
    await cloudinary.uploader.destroy(piece.filename)
  }
  res.status(200).json(project)
})

module.exports = router
