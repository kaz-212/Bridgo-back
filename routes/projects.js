const express = require('express')
const router = express.Router()
const Project = require('../models/projects')
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

router.get('/', (req, res) => {
  console.log(req.body, 'get')
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

module.exports = router
