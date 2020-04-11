// **********************************
// IMPORTS
// **********************************
const express = require('express');
const router = express.Router();

// **********************************
// SCHEMA IMPORTS
// **********************************
const Shoppings = require('../models/shoppings');

// **********************************
// GET ROUTE FOR HANDLING SHOPPING ITEMS
// **********************************
router.get('/', (req, res) => {
	res.render('shoppings/home');
});

// **********************************
// POST ROUTE FOR HANDLING SHOPPING ITEMS
// **********************************

// **********************************
// EXPORTING ROUTER
// **********************************
module.exports = router;
