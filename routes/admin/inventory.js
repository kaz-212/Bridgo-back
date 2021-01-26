const express = require('express')
const router = express.Router()
const Product = require('../../models/inventory/product')
const Particular = require('../../models/inventory/particular')
const Size = require('../../models/inventory/size')
const multer = require('multer')
const { storage, cloudinary } = require('../../cloudinary')
const upload = multer({ storage })

// functions
const delParticular = async id => {
  const particular = await Particular.findByIdAndDelete(id)
  const sizeId = particular.size
  const foundSize = await Size.findByIdAndUpdate(
    sizeId,
    { $pullAll: { products: [particular.product] } },
    { new: true }
  )
  // if size has no associated products then delete size
  if (!foundSize.products.length) {
    await Size.findByIdAndDelete(foundSize._id)
  }
  return particular
}

// routes
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

// add product
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
      populate: { path: 'size', select: 'name' }
    },
    (err, doc) => {
      if (err) {
        return console.log(err)
      }
      res.json(doc)
    }
  )
})

router.post('/particular', async (req, res) => {
  const { productId, particular } = req.body
  const size = await Size.findOneAndUpdate(
    { name: particular.size }, // to lowercase in setter
    { $push: { products: productId } },
    { upsert: true, new: true } // if size doesnt exist, creates new document
  )
  const newParticular = new Particular({
    product: productId,
    price: parseFloat(particular.price),
    unitsRemaining: particular.unitsRemaining,
    unitsSold: particular.unitsSold,
    size: size._id
  })
  const savedParticular = await newParticular.save()
  const product = await Product.findByIdAndUpdate(
    productId,
    { $push: { particulars: savedParticular._id } },
    { new: true }
  ).populate({
    path: 'particulars',
    populate: [
      { path: 'size', select: 'name' }
      // { path: 'orders' } // TODO uncomment when we add orders
    ]
  })
  res.json(product)
})

// edit product
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
  editedProduct.populate(
    {
      path: 'particulars',
      populate: { path: 'size', select: 'name' }
    },
    (err, doc) => {
      if (err) {
        return console.log(err)
      }
      res.json(doc)
    }
  )
})

// edit particular
router.put('/particular/:id', async (req, res) => {
  const { id } = req.params
  const particular = req.body
  const oldParticular = await Particular.findById(id).populate('size')
  // check if size has changed
  if (particular.size.name !== oldParticular.size.name) {
    // rm product from size array and delete if necessary
    await Size.findByIdAndUpdate(
      oldParticular.size._id,
      { $pullAll: { products: [oldParticular.product] } },
      { new: true },
      async (err, doc) => {
        if (err) {
          return console.log(err)
        }
        if (!doc.products.length) {
          await Size.findByIdAndDelete(doc._id)
        }
      }
    )
    // check if new size exists and if not, add new size
    const newSize = await Size.findOneAndUpdate(
      { name: particular.size.name }, // to lowercase in setter
      { $push: { products: particular.product } },
      { upsert: true, new: true } // if size doesnt exist, creates new document
    )
    // add new size to particular
    particular.size = newSize._id
    const editedParticular = await Particular.findByIdAndUpdate(id, particular, { new: true }).populate('size') //TODO populate orders
    return res.json(editedParticular)
  } else {
    // if the size name is the same
    console.log(particular)
    const editedParticular = await Particular.findByIdAndUpdate(id, particular, { new: true }).populate('size') //TODO populate orders
    return res.json(editedParticular)
  }
})

router.delete('/product/:id', async (req, res) => {
  const { id } = req.params
  const product = await Product.findByIdAndDelete(id)
  // delete particulars from particular array
  for (const particularId of product.particulars) {
    // delete product from array of products associated with each size
    delParticular(particularId)
  }
  // delete images from cloudinary
  for (const image of product.images) {
    await cloudinary.uploader.destroy(image.filename)
  }
  res.send(id)
})

router.delete('/particular/:id', async (req, res) => {
  const { id } = req.params
  const particular = await delParticular(id)
  // console.log(particular)
  const product = await Product.findByIdAndUpdate(
    particular.product,
    { $pullAll: { particulars: [particular._id] } },
    { new: true }
  ).populate({
    path: 'particulars',
    populate: [
      { path: 'size', select: 'name' }
      // { path: 'orders' } // TODO uncomment when we add orders
    ]
  })

  res.json(product)
})

module.exports = router
