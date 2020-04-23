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
const Basket = require('../models/basket');

// **********************************
// GET ROUTE FOR DISPLAYING ALL ITEMS
// **********************************
router.get('/', async (req, res) => {
	await Items.find({}).populate('category_id').exec(async (err, items) => {
		if (err) {
			console.log(err);
		} else {
			await Basket.findOne({ user_id: req.user._id }, (err, basket) => {
				if (err) {
					res.render('items/index', { Items: items, BasketQuantity: 0 });
				} else {
					res.render('items/index', { Items: items, BasketQuantity: basket.items.length });
				}
			});
		}
	});
});

// **********************************
// GET ROUTE FOR HANDLING NEW ITEMS
// **********************************
router.get('/new', middleware.isLoggedIn, async (req, res) => {
	const Categories = await getCategories();
	let Names = [];
	Categories.forEach((category) => {
		Names.push(category.name);
	});
	res.render('items/new', { data: {}, errors: {}, categories: Names });
});

// **********************************
// POST ROUTE FOR HANDLING NEW ITEMS
// **********************************

router.post('/new', Upload.single('image'), [ Validators['newitem'] ], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const Categories = await getCategories();
		let Names = [];
		Categories.forEach((category) => {
			Names.push(category.name);
		});
		res.render('items/new', {
			data: req.body,
			errors: errors.mapped(),
			categories: Names
		});
	} else {
		const { name, quantity, reorder_quantity, category, store } = req.body.items;
		const newItems = {
			name,
			quantity,
			reorder_quantity,
			image: req.file.filename,
			category,
			store,
			created_at: Date.now()
		};

		let CategoryID = await ItemQueries.FindCategoryIDByName(category);
		ItemQueries.createItem(CategoryID, newItems);
		req.flash('success', 'You just successfully added a new item!');
		res.redirect('/items/new');
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
router.delete('/:id', async (req, res) => {
	await ItemQueries.DeleteItemByID(req.params.id);
	res.redirect('/items');
});

// **********************************
// EXPORTING ROUTER
// **********************************
module.exports = router;
