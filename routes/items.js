// **********************************
// IMPORTS
// **********************************
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Multer = require('multer');
const path = require('path');
const { validationResult } = require('express-validator');
const AWS = require('aws-sdk');

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
const s3 = new AWS.S3({
	accessKeyId: process.env.S3_ACCESSKEYID,
	secretAccessKey: process.env.S3_SECRETKEY
});

const storage = Multer.memoryStorage();
const Upload = Multer({ storage });

// **********************************
// SCHEMA IMPORTS
// **********************************
const Items = require('../models/items');
const Categories = require('../models/categories');
const Stock = require('../models/stock');
const Users = require('../models/users');

// *******************************************************
// GET ROUTE FOR DISPLAYING ALL ITEMS
// *******************************************************
router.get('/', async (req, res) => {
	await Items.find({}).populate('category_id').sort({ name: 1 }).exec((err, items) => {
		if (err) {
			req.flash('error', 'An error occurred loading items data.');
			res.redirect('back');
		} else {
			res.render('items/index', { Items: items });
		}
	});
});

// *******************************************************
// GET ROUTE FOR HANDLING NEW ITEMS
// *******************************************************
router.get('/new', middleware.isLoggedIn, async (req, res) => {
	await Categories.find({}).then((categories) => {
		res.render('items/new', { data: {}, errors: {}, categories });
	});
});

// *******************************************************
// POST ROUTE FOR HANDLING NEW ITEMS
// *******************************************************
router.post('/new', middleware.isLoggedIn, Upload.single('image'), [ Validators['newitem'] ], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		await Categories.find({}).then((categories) => {
			res.render('items/new', {
				data: req.body,
				errors: errors.mapped(),
				categories
			});
		});
	} else {
		const { name, category, store } = req.body.items;
		let image = req.file ? req.file.filename : 'no_image.png';

		if (req.file && !req.file.originalname.match(/\.(jpg|JPG|jfif|JFIF|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
			// NOT AN IMAGE FILE WAS SELECTED
			req.flash('error', 'Only image files are allowed for upload.');
			res.redirect('back');
		} else {
			// CHECK IF NAME ALREADY EXISTS
			const filename = req.user._id + '.' + req.file.originalname;
			const params = {
				Bucket: 'house-storage-items',
				Key: filename,
				Body: req.file.buffer,
				ContentType: req.file.mimetype,
				ACL: 'public-read'
			};

			s3.upload(params, async function(err, data) {
				if (err) {
					req.flash('error', 'Error occurred while updating your image.');
					res.redirect('back');
				} else {
					await Items.find({ name: name.toLowerCase() }).then(async (found_item) => {
						if (found_item.length) {
							req.flash('error', 'Item with this name already exists.');
							res.redirect('back');
						} else {
							const Item = {
								name: name.toLowerCase(),
								image: process.env.S3_BUCKETITEM + filename,
								category_id: category,
								store,
								created_at: Date.now()
							};

							await Items.create(Item).then(async (item, err) => {
								if (err) {
									req.flash('error', 'An error occurred creating your item.');
									res.redirect('back');
								} else {
									await Categories.findByIdAndUpdate(
										category,
										{ $push: { items: item._id } },
										{ new: true, useFindAndModify: false }
									).then((category_, err) => {
										if (err) {
											req.flash('error', 'An error occurred updating the category of the item.');
											res.redirect('back');
										} else {
											req.flash('success', 'You just successfully added a new item!');
											res.redirect('back');
										}
									});
								}
							});
						}
					});
				}
			});
		}
	}
});

// *******************************************************
// GET ROUTE FOR SEARCH
// *******************************************************
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

// *******************************************************
// POST ROUTE FOR SEARCHING ITEMS
// *******************************************************
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

// *******************************************************
// GET ROUTE FOR DISPLAYING AN ITEM
// *******************************************************
router.get('/:id', async (req, res) => {
	await Items.findById(req.params.id).populate('category_id').exec((err, item) => {
		if (err) {
			req.flash('error', 'An error occurred finding this item.');
			res.redirect('back');
		} else {
			req.flash('success', 'You have successfully found this item.');
			res.render('items/show', { Item: item });
		}
	});
});

// *******************************************************
// DELETE ROUTE FOR DELETING ITEMS, ONLY FOR ADMINS LATER
// *******************************************************
router.delete('/:id', middleware.isLoggedIn, async (req, res) => {
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

// *******************************************************
// EXPORTING ROUTER
// *******************************************************
module.exports = router;
