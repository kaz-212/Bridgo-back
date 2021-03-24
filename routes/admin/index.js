const express = require('express');
const router = express.Router({ mergeParams: true });

const inventory = require('./inventory.js');
const orders = require('./orders.js');
const projects = require('./projects.js');
const exhibitions = require('./exhibitions.js');

// TODO protect all these routes except login route
// routes
router.use('/inventory', inventory);
router.use('/orders', orders);
router.use('/projects', projects);
router.use('/exhibitions', exhibitions);

module.exports = router;
