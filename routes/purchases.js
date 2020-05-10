// **********************************
// IMPORTS
// **********************************
const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const mongoose = require('mongoose');

// **********************************
// SCHEMA IMPORTS
// **********************************
const Purchase = require('../models/purchases');
const Team = require('../models/teams');
const Stock = require('../models/stock');

router.get('/', middleware.isLoggedIn, async (req, res) => {
	await Purchase.find({})
		.populate({
			path: 'user_id',
			match: { team_id: req.user.team_id }
		})
		.populate('items.id')
		.sort({ purchased_at: -1 })
		.lean()
		.then(async (purchases, err) => {
			if (err) {
				req.flash('error', 'An error occurred finding your purchases.');
				res.render('purchases/index', { purchases: null });
			} else {
				let Total = 0;
				purchases.forEach((purchase) => {
					if (purchase.user_id) {
						purchase.items.forEach((item) => {
							Total += item.quantity * item.price;
						});
					}
				});

				await Team.find({}, 'name').then((teams, err) => {
					if (err) {
						req.flash('error', 'An error occurred loading your teams.');
						res.render('purchases/index', { purchases: null });
					} else {
						res.render('purchases/index', {
							purchases,
							teams,
							TotalPurchase: Total,
							fromDate: '',
							toDate: ''
						});
					}
				});
			}
		});
});

router.post('/search', middleware.isLoggedIn, async (req, res) => {
	if (req.body.to && req.body.from) {
		let From = new Date(req.body.from);
		let To = new Date(req.body.to).setHours(23, 59, 59, 999);
		if (From < To) {
			await Purchase.find({
				purchased_at: { $gte: From, $lt: To }
			})
				.populate({
					path: 'user_id',
					match: { team_id: req.user.team_id }
				})
				.populate('items.id')
				.then(async (purchases, err) => {
					if (err) {
						req.flash('error', 'An error occurred finding your purchases.');
						res.render('purchases/index', { purchases: null });
					} else {
						let Total = 0;
						let Length = 0;
						purchases.forEach((purchase) => {
							if (purchase.user_id) {
								Length++;
								purchase.items.forEach((item) => {
									Total += item.quantity * item.price;
								});
							}
						});

						await Team.find({}, 'name').then((teams, err) => {
							if (err) {
								req.flash('error', 'An error occurred loading your team data.');
								res.render('purchases/index', { purchases: null });
							} else {
								if (purchases && purchases.length) {
									req.flash('success', `You have successfully found ${Length} purchases.`);
									res.render('purchases/index', {
										purchases,
										teams,
										TotalPurchase: Total,
										fromDate: req.body.from,
										toDate: req.body.to
									});
								} else {
									req.flash('error', 'There are no purchases for the provided period');
									res.render('purchases/index', {
										purchases: null,
										TotalPurchase: Total,
										fromDate: '',
										toDate: ''
									});
								}
							}
						});
					}
				});
		} else {
			req.flash('error', 'You must supply a valid range for the dates.');
			res.render('purchases/index', {
				purchases: null,
				TotalPurchase: 0,
				fromDate: '',
				toDate: ''
			});
		}
	} else {
		req.flash('error', 'You have not provided valid dates.');
		res.render('purchases/index', {
			purchases: null,
			TotalPurchase: 0,
			fromDate: '',
			toDate: ''
		});
	}
});

router.get('/:id', middleware.isLoggedIn, async (req, res) => {
	if (mongoose.Types.ObjectId.isValid(req.params.id)) {
		await Purchase.findById(req.params.id).populate('user_id').populate('items.id').then(async (purchase, err) => {
			if (err) {
				req.flash('error', 'An error occurred finding your purchase.');
				res.render('purchases/show', { purchase: null });
			} else {
				await Team.find({}, 'name').then((teams, err) => {
					if (err) {
						req.flash('error', 'An error occurred loading your team data.');
						res.render('purchases/show', { purchase: null });
					} else {
						if (purchase) {
							req.flash('success', 'You have successfully found your purchase.');
							res.render('purchases/show', { purchase, teams });
						} else {
							req.flash('error', 'There is no purchase with this purchase ID.');
							res.render('purchases/show', { purchase: null });
						}
					}
				});
			}
		});
	} else {
		req.flash('error', 'You have entered an invalid purchase ID.');
		res.render('purchases/show', { purchase: null });
	}
});

router.post('/new', middleware.isLoggedIn, async (req, res) => {
	const { quantity, price, id } = req.body;
	const items = [];
	const stock = [];

	if (quantity && price && id) {
		quantity.forEach((qty, idx) => {
			items.push({
				id: id[idx],
				quantity: qty,
				price: price[idx]
			});
			stock.push({
				id: id[idx],
				quantity: qty,
				reorder_quantity: 0
			});
		});

		await Purchase.create(
			{
				user_id: req.user._id,
				items: items
			},
			async (err, purchase) => {
				if (err) {
					req.flash('error', 'An error occurred creating your purchase.');
					res.redirect('/basket');
				} else {
					// Add elements to stock
					stock.forEach((item, idx) => {
						Stock.find({ team_id: req.user.team_id, 'items.id': item.id }).then(async (foundStock) => {
							// IF EXIST
							if (foundStock.length) {
								await Stock.updateOne(
									{ team_id: req.user.team_id, 'items.id': item.id },
									{ $inc: { 'items.$.quantity': item.quantity } }
								).then((updatedStock, err) => {
									if (err) {
										console.log('Error occured updating stock: ', err);
									}
								});
							} else {
								// IF NOT EXIST
								await Stock.create({
									team_id: req.user.team_id,
									items: [ item ]
								}).then((createdStock, err) => {
									if (err) {
										console.log('Error occured creating stock: ', err);
									}
								});
							}
						});
					});

					// Remove elements from basket
					req.session.baskets.forEach((basket, idx) => {
						if (basket.id.equals(req.user._id)) {
							req.session.baskets.splice(idx, 1);
						}
					});

					req.flash('success', 'You have successfully created a new purchase!');
					res.redirect('/basket');
				}
			}
		);
	} else {
		req.flash('error', 'You have not added items in your basket.');
		res.redirect('/basket');
	}
});

module.exports = router;
