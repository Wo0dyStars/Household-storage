// **********************************
// IMPORTS
// **********************************
const express = require('express');
const router = express.Router();
const Multer = require('multer');
const path = require('path');
const { check, validationResult, matchedData, body } = require('express-validator');

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

const Upload = Multer({
	storage
	//,
	// fileFilter: (req, file, cb) => {
	// 	if (!file.originalname.match(/\.(jpg|JPG|jpeg|jfif|JFIF|JPEG|png|PNG|gif|GIF)$/)) {
	// 		cb(new Error('Only image files are allowed!'), false);
	// 	}
	// 	cb(null, true);
	// }
});

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
	res.render('items/new', { data: {}, filedata: {}, errors: {} });
});

// **********************************
// POST ROUTE FOR HANDLING NEW ITEMS
// **********************************
router.post(
	'/new',
	Upload.single('image'),
	[
		check('items[name]')
			.isLength({ min: 5, max: 20 })
			.withMessage('Name must be between 5 and 20 characters')
			.trim(),
		body('items[quantity]').custom((value) => {
			if (value < 1) {
				return Promise.reject('Quantity must be at least 1');
			} else {
				return Promise.resolve();
			}
		}),
		body('items[reorder_quantity]').custom((value) => {
			if (value < 1) {
				return Promise.reject('Reorder quantity must be at least 1');
			} else {
				return Promise.resolve();
			}
		})
	],
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty() || !req.file.originalname.match(/\.(jpg|JPG|jpeg|jfif|JFIF|JPEG|png|PNG|gif|GIF)$/)) {
			res.render('items/new', {
				data: req.body,
				filedata: { msg: 'Files must be either .JPG, .GIF, .PNG or .JFIF' },
				errors: errors.mapped()
			});
		} else {
			// const data = matchedData(req);
			// console.log('Sanitized: ', data);

			const { name, quantity, reorder_quantity } = req.body.items;
			const newItems = { name, quantity, reorder_quantity, image: req.file.filename };

			Items.create(newItems, (err, newItem) => {
				if (err) console.log(err);
				console.log(newItem);
			});

			req.flash('success', 'You just successfully added a new item!');
			res.redirect('/items/new');
		}
	}
);

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
