// **********************************
// IMPORTS
// **********************************
const express = require('express');
const router = express.Router();

// **********************************
// SCHEMA IMPORTS
// **********************************
const Items = require('../models/items');

// **********************************
// GET ROUTE FOR DISPLAYING ALL ITEMS
// **********************************
router.get('/', (req, res) => {
	Items.find({}, (err, items) => {
		if (err) {
			console.log(err);
		} else {
			res.render('items/index', {
				Items: items
			});
		}
	});
});

// **********************************
// GET ROUTE FOR HANDLING NEW ITEMS
// **********************************
router.get('/new', (req, res) => {
	res.render('items/new');
});

// **********************************
// POST ROUTE FOR HANDLING NEW ITEMS
// **********************************
router.post('/new', (req, res) => {
	const { name, image, quantity, reorder_quantity } = req.body.items;
	const newItems = { name, image, quantity, reorder_quantity };

	Items.create(newItems, (err, newItem) => {
		if (err) console.log(err);
		console.log(newItem);
		res.redirect('new');
	});
});

// **********************************
// GET ROUTE FOR DISPLAYING AN ITEM
// **********************************
router.get('/:id', (req, res) => {
	res.render('items/show', { ItemID: req.params.id });
});

// **********************************
// DELETE ROUTE FOR DELETING ITEMS
// **********************************
router.delete('/:id', (req, res) => {
	Items.findByIdAndRemove(req.params.id, (err) => {
		if (err) {
			res.redirect('/items');
		} else {
			res.redirect('/items');
		}
	});
});

// **********************************
// EXPORTING ROUTER
// **********************************
module.exports = router;
