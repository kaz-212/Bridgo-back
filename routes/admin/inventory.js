const express = require('express')
const router = express.Router()
const Product = require('../../models/inventory/product')
const Particular = require('../../models/inventory/particular')
const Size = require('../../models/inventory/size')
const multer = require('multer')
const { storage, cloudinary } = require('../../cloudinary')
const upload = multer({ storage })

// router.get('/', async (req, res) => {
//   await Product.find(async (err, product) => {
//     const opts = [
//       { path: 'particulars' },
//       { path: 'particulars', select: 'size' }
//       // { path: 'particulars', select: 'orders' }
//     ]
//     const populatedProducts = await Product.populate(product, opts)
//     for (const item of populatedProducts) {
//       console.log(item.particulars)
//     }
//     res.send(populatedProducts)
//   })
// })

router.get('/', async (req, res) => {
  const products = await Product.find({}).populate({
    path: 'particulars',
    populate: [
      { path: 'size', select: 'name' }
      // { path: 'orders' } // TODO uncomment when we add orders
    ]
  })
  res.json(products)
})

router.post('/', upload.array('imgs'), async (req, res) => {
  console.log('Joooo')
  const product = JSON.parse(req.body.product)
  const { name, type, description, details } = product
  const newProduct = new Product({ name, type, description })

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

  for (const detail of details) {
    // find or create size
    const currentSize = await Size.findOneAndUpdate(
      { name: detail.size }, // to lowercase in setter
      { $push: { products: newProduct._id } },
      { upsert: true, new: true } // if size doesnt exist, creates new document
    )

    // create new particular
    const particular = new Particular({
      product: newProduct._id,
      price: parseFloat(detail.price),
      unitsRemaining: parseInt(detail.qty),
      size: currentSize
    })
    // add particular to the products array
    const savedParticular = await particular.save()
    newProduct.particulars.push(savedParticular._id)
  }

  const savedProduct = await newProduct.save()
  savedProduct.populate(
    {
      path: 'particulars',
      populate: [{ path: 'size', select: 'name' }]
    },
    (err, doc) => {
      if (err) {
        return console.log(err)
      }
      res.json(doc)
    }
  )
  // console.log(savedProduct)

  // particular.populate([{ path: 'product' }, { path: 'size_price_qty.size', select: 'size' }], (err, doc) => {
  //   if (err) {
  //     return console.log(err)
  //   }
  // sends the particular (which is the product with an array of sizes/prices/quantities)
  // res.json(savedProduct)
})

router.put('/product/:id', upload.array('imgs'), async (req, res) => {
  const product = JSON.parse(req.body.product)
  const filenames = JSON.parse(req.body.filenames) // to del
  for (let i = 0; i < req.files.length; i++) {
    let image = {}
    image.imgURL = req.files[i].path
    image.filename = req.files[i].filename
    if (!product.images.length & (i === 0)) {
      image.isMain = true // default is false
    }
    product.images.push(image)
  }
  editedProduct = await Product.findByIdAndUpdate(product._id, product, { new: true })
  for (const filename of filenames) {
    await cloudinary.uploader.destroy(filename)
  }
  res.json(editedProduct)
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params
  const product = await Product.findByIdAndDelete(id)
  // delete particulars from particular array
  for (const particularId of product.particulars) {
    // delete product from array of products associated with each size
    const particular = await Particular.findByIdAndDelete(particularId)
    const sizeId = particular.size._id
    const foundSize = await Size.findById(sizeId)
    const newProdArray = foundSize.products.filter(prod => !prod.equals(product._id))
    if (!newProdArray.length) {
      await Size.findByIdAndDelete(sizeId)
    } else {
      foundSize.products = newProdArray
      await foundSize.save()
    }
  }
  // delete images from cloudinary
  for (const image of product.images) {
    await cloudinary.uploader.destroy(image.filename)
  }
  res.send(id)
})

module.exports = router
