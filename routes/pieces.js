const express = require('express')
const router = express.Router()
const Piece = require('../models/pieces')

// get all, for testing
router.get('/', (req, res) => {
  Piece.find().then(pieces => res.json(pieces))
})

// get for specific project
// router.get('/:id', (req, res) => {
//   Piece.findBy
// })

router.post('/', async (req, res) => {
  const { project, isMain, imgURL, description, price, size, year, materials } = req.body.pieces
  const piece = new Piece({
    project,
    isMain,
    imgURL,
    description,
    price,
    size,
    materials,
    year
  })
  await piece.save()
  res.json(piece)
})
