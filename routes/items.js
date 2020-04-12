// **********************************
// IMPORTS
// **********************************
const express = require('express');
const router = express.Router();
const Multer = require('multer');
const path = require('path');
const { validationResult } = require('express-validator');

// **********************************
// MIDDLEWARE IMPORTS
// **********************************
const Validators = require('../middleware/validators');

// **********************************
// SET UP MULTER TO RECEIVE IMAGE FILES
// **********************************
const storage = Multer.diskStorage({
	destination: './public/images',
	filename: function(req, file, cb) {
		const uniqueSuffix = Date.now() + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
		cb(null, uniqueSuffix);
	}
});

const Upload = Multer({ storage });

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
	res.render('items/new', { data: {}, errors: {} });
});

// **********************************
// POST ROUTE FOR HANDLING NEW ITEMS
// **********************************

router.post('/new', Upload.single('image'), [ Validators ], (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.render('items/new', {
			data: req.body,
			errors: errors.mapped()
		});
	} else {
		const { name, quantity, reorder_quantity } = req.body.items;
		const newItems = { name, quantity, reorder_quantity, image: req.file.filename };

		Items.create(newItems, (err, newItem) => {
			if (err) {
				console.log(err);
			} else {
				req.flash('success', 'You just successfully added a new item!');
				res.redirect('/items/new');
			}
		});
	}
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
