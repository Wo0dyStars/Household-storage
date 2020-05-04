// **********************************
// IMPORTS
// **********************************
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Multer = require('multer');
const path = require('path');
const { validationResult } = require('express-validator');

// **********************************
// QUERY IMPORTS
// **********************************
const ItemQueries = require('../queries/items');
const { getCategories, FindCategoryNameByID } = require('../queries/categories');

// **********************************
// MIDDLEWARE IMPORTS
// **********************************
const Validators = require('../middleware/validators');
const middleware = require('../middleware');

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
const Categories = require('../models/categories');
const Stock = require('../models/stock');
const Users = require('../models/users');

// **********************************
// GET ROUTE FOR DISPLAYING ALL ITEMS
// **********************************
router.get('/', async (req, res) => {
	await Items.find({}).populate('category_id').sort({ name: 1 }).exec((err, items) => {
		if (err) {
			console.log(err);
		} else {
			res.render('items/index', { Items: items });
		}
	});
});

// **********************************
// GET ROUTE FOR HANDLING NEW ITEMS
// **********************************
router.get('/new', middleware.isLoggedIn, async (req, res) => {
	const categories = await getCategories();
	res.render('items/new', { data: {}, errors: {}, categories });
});

// **********************************
// POST ROUTE FOR HANDLING NEW ITEMS
// **********************************

router.post('/new', Upload.single('image'), [ Validators['newitem'] ], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const categories = await getCategories();
		res.render('items/new', {
			data: req.body,
			errors: errors.mapped(),
			categories
		});
	} else {
		const { name, quantity, reorder_quantity, category, store } = req.body.items;
		const Item = {
			name,
			image: req.file.filename,
			category_id: category,
			store,
			created_at: Date.now()
		};

		await Items.create(Item).then(async (item, err) => {
			if (err) {
				console.log('Error occured creating a new item: ', err);
			} else {
				await Categories.findByIdAndUpdate(
					category,
					{ $push: { items: item._id } },
					{ new: true, useFindAndModify: false }
				).then((category_, err) => {
					if (err) {
						console.log('Error occured updating category id: ', err);
					} else {
						console.log('A new category has been added: ', category_);
						req.flash('success', 'You just successfully added a new item!');
						res.redirect('/items/new');
					}
				});
			}
		});
	}
});

router.get('/search', async (req, res) => {
	await Items.find({}).populate('category_id').sort({ name: 1 }).exec((err, items) => {
		if (err) {
			req.flash('error', 'An error occurred loading items data.');
			res.redirect('back');
		} else {
			res.render('items/index', { Items: items });
		}
	});
});

router.post('/search', async (req, res) => {
	if (req.body.search) {
		await Items.find({ name: { $regex: req.body.search, $options: 'i' } })
			.populate('category_id')
			.sort({ name: 1 })
			.exec((err, items) => {
				if (err) {
					req.flash('error', 'An error occurred loading items data.');
					res.redirect('back');
				} else {
					if (items.length) {
						req.flash('success', `You have successfully found ${items.length} item(s).`);
						res.render('items/index', { Items: items });
					} else {
						req.flash('error', 'Unfortunately, you have found 0 items.');
						res.render('items/index', { Items: items });
					}
				}
			});
	} else {
		req.flash('error', 'You have not entered search data.');
		res.redirect('back');
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
// Stock.find({}).then((err, ok) => {
// 	console.log(err);
// });
router.delete('/:id', async (req, res) => {
	await ItemQueries.DeleteItemByID(req.params.id);
	await Stock.updateMany(
		{ 'items.id': req.params.id },
		{ $pull: { items: { id: req.params.id } } }
	).then((deleted_stock, err) => {
		if (err) {
			console.log('Error occured deleting item from stock: ', err);
		} else {
			console.log('Successful deletion: ', deleted_stock);
		}
	});
	res.redirect('/items');
});

// **********************************
// EXPORTING ROUTER
// **********************************
module.exports = router;
