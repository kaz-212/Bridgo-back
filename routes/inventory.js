const express = require('express')
const router = express.Router()
const Product = require('../models/inventory/product')
const Particular = require('../models/inventory/product_size')
const Size = require('../models/inventory/size')
const multer = require('multer')
const { storage, cloudinary } = require('../cloudinary')
const upload = multer({ storage })

router.get('/', async (req, res) => {
  await Particular.find(async (err, particular) => {
    const opts = [{ path: 'product' }, { path: 'size_price_qty.size', select: 'size' }]
    const populatedParticulars = await Particular.populate(particular, opts)
    res.send(populatedParticulars)
  })
})

router.post('/', upload.array('imgs'), async (req, res) => {
  const product = JSON.parse(req.body.product)
  const { name, type, description, sizes } = product
  const newProduct = new Product({ name, type, description })
  console.log(newProduct)

  // append images
  for (let i = 0; i < req.files.length; i++) {
    let image = {}
    image.imgURL = req.files[i].path
    image.filename = req.files[i].filename
    if (i === 0) {
      image.isMain = true // default is false
    }
    newProduct.images.push(image)
  }
  await newProduct.save()

  const particular = new Particular({ product: newProduct })

  for (const size of sizes) {
    const currentSize = await Size.findOneAndUpdate(
      { size: size.size }, // to lowercase in setter
      { $push: { products: newProduct._id } },
      { upsert: true, new: true } // if size doesnt exist, creates new document
    )
    // for each size (and price), create new particular (product with size, price, quantity)
    let sizeInfo = {}
    sizeInfo.size = currentSize
    sizeInfo.price = parseFloat(size.price)
    sizeInfo.qty = parseInt(size.qty)
    size.index ? (sizeInfo.index = parseInt(size.index)) : (sizeInfo.index = 0)
    particular.size_price_qty.push(sizeInfo)
  }

  await particular.save()

  particular.populate([{ path: 'product' }, { path: 'size_price_qty.size', select: 'size' }], (err, doc) => {
    if (err) {
      return console.log(err)
    }
    // sends the particular (which is the product with an array of sizes/prices/quantities)
    res.json(doc)
  })
})

router.put('/:id', upload.array('imgs'), (req, res) => {
  const particular = JSON.parse(req.body.particular)
  const sizes = JSON.parse(req.body.sizes)
  // add any new images to particular.product.images
  // update product with particular.product
  // product section done
  //
  console.log(particular, sizes)
})

module.exports = router
