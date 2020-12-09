const express = require('express')
const router = express.Router()
const Project = require('../models/projects')
const multer = require('multer')
const upload = multer({ dest: '../uploads/' })

router.get('/', (req, res) => {
  console.log(req.body, 'get')
  Project.find({})
    .sort({ index: 1 })
    .then(projects => res.json(projects))
})

router.post('/', upload.single('img'), async (req, res) => {
  const project = JSON.parse(req.body.project)
  const { name, description, year } = project
  console.log(name, description, year)
  // const index = await Project.countDocuments()
  // const project = new Project({
  //   name,
  //   description,
  //   year,
  //   index
  // })
  // for (piece of req.body.pieces) {
  //   const { isMain, imgURL, pieceDescription, price, size, pieceYear, materials, showInProj } = piece
  //   const newPiece = {
  //     project,
  //     isMain,
  //     imgURL,
  //     description: pieceDescription,
  //     price,
  //     size,
  //     materials,
  //     year: pieceYear,
  //     index: 0,
  //     showInProj
  //   }
  //   project.pieces.push(newPiece)
  // }
  // await project.save()
  // res.json(project)
})

module.exports = router
