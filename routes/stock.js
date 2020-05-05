// **********************************
// IMPORTS
// **********************************
const express = require('express');
const router = express.Router();
const middleware = require('../middleware');

// **********************************
// SCHEMA IMPORTS
// **********************************
const Stock = require('../models/stock');

// *******************************************************
// GET ROUTE FOR DISPLAYING STOCK
// *******************************************************
router.get('/', middleware.isLoggedIn, async (req, res) => {
	if (req.user) {
		await Stock.find({ team_id: req.user.team_id }).populate('items.id').then((stock, err) => {
			if (err) {
				req.flash('error', 'An error occurred loading your stock data.');
				res.render('stock/index', { stock: null });
			} else {
				res.render('stock/index', { stock });
			}
		});
	} else {
		req.flash('error', 'User has been not found.');
		res.render('stock/index', { stock: null });
	}
});

// ************************************************************
// POST ROUTE FOR ADDING NEW STOCK OR UPDATING EXISTING STOCK
// ************************************************************
router.post('/new', middleware.isLoggedIn, async (req, res) => {
	const StockItem = {
		id: req.body.StockID,
		quantity: 1,
		reorder_quantity: 0
	};

	await Stock.find({ team_id: req.user.team_id }).then(async (found_team) => {
		if (found_team.length) {
			// UPDATE
			await Stock.find({ 'items.id': req.body.StockID, team_id: req.user.team_id }).then(async (found_item) => {
				if (!found_item.length) {
					// ITEM DOES NOT EXIST IN STOCK
					await Stock.updateOne(
						{ team_id: req.user.team_id },
						{ $push: { items: StockItem } },
						{ new: true, useFindAndModify: false }
					).then((updated_stock, err) => {
						if (err) {
							req.flash('error', 'An error occurred updating your stock data.');
							res.redirect('back');
						} else {
							req.flash('success', 'You have successfully added this item to your stock.');
							res.redirect('back');
						}
					});
				} else {
					// ITEM EXISTS IN STOCK
					req.flash('error', 'This item has already been in your stock.');
					res.redirect('back');
				}
			});
		} else {
			// CREATE
			await Stock.create({
				team_id: req.user.team_id,
				items: [ StockItem ]
			}).then((stock, err) => {
				if (err) {
					req.flash('error', 'An error occurred creating new stock.');
					res.redirect('back');
				} else {
					req.flash('success', 'You have successfully added this item to your stock.');
					res.redirect('back');
				}
			});
		}
	});
});

// *******************************************************
// GET ROUTE FOR SEARCH
// *******************************************************
router.get('/search', middleware.isLoggedIn, async (req, res) => {
	await Stock.find({ team_id: req.user.team_id }).populate('items.id').then((stock, err) => {
		if (err) {
			req.flash('error', 'An error occurred loading items data.');
			res.redirect('back');
		} else {
			res.render('stock/index', { stock });
		}
	});
});

// *******************************************************
// POST ROUTE FOR SEARCHING STOCK ITEMS
// *******************************************************
router.post('/search', middleware.isLoggedIn, async (req, res) => {
	if (req.body.search) {
		if (req.user) {
			await Stock.find({ team_id: req.user.team_id })
				.populate({
					path: 'items.id',
					match: { name: { $regex: req.body.search, $options: 'i' } }
				})
				.then((stock, err) => {
					if (err) {
						req.flash('error', 'An error occurred loading your stock items.');
						res.redirect('back');
					} else {
						if (stock.length) {
							let length = 0;
							stock[0].items.forEach((item) => {
								if (item.id) {
									length++;
								}
							});
							req.flash('success', `You have successfully found ${length} item(s).`);
							res.render('stock/index', { stock });
						} else {
							req.flash('error', 'Unfortunately, you have found 0 items.');
							res.render('stock/index', { stock });
						}
					}
				});
		} else {
			req.flash('error', 'You must be signed in to do this.');
			res.redirect('back');
		}
	} else {
		req.flash('error', 'You have not entered search data.');
		res.redirect('back');
	}
});

// *******************************************************
// EDIT ROUTE FOR UPDATING STOCK
// *******************************************************
router.post('/edit', middleware.isLoggedIn, async (req, res) => {
	Items = req.body.item;
	let Modified = 0;
	await Items.forEach((item, idx) => {
		Stock.updateOne(
			{ team_id: req.user.team_id, 'items.id': item[0] },
			{ $set: { 'items.$.quantity': item[1], 'items.$.reorder_quantity': item[2] } }
		).then((updated_stock, err) => {
			if (err) {
				req.flash('error', 'An error occurred updating your stock data.');
				res.redirect('back');
			} else {
				if (updated_stock.nModified === 1) {
					Modified++;
				}
			}

			if (idx === Items.length - 1) {
				if (Modified > 0) {
					req.flash('success', 'You have successfully updated details of items.');
					res.redirect('back');
				} else {
					req.flash('error', 'You have not changed any values.');
					res.redirect('back');
				}
			}
		});
	});
});

// *******************************************************
// EXPORTING STOCK ROUTER
// *******************************************************
module.exports = router;
