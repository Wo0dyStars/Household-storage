// **********************************
// IMPORTS
// **********************************
const express = require('express');
const router = express.Router();
const middleware = require('../middleware');

// **********************************
// SCHEMA IMPORTS
// **********************************
const Purchase = require('../models/purchases');
const Team = require('../models/teams');
const Stock = require('../models/stock');

router.get('/', async (req, res) => {
	await Purchase.find({}).populate('user_id').populate('items.id').then(async (purchases, err) => {
		if (err) {
			console.log('Error occurred loading Purchase data: ', err);
			res.render('purchases/index', { purchases: null });
		} else {
			await Team.find({}, 'name').then((teams, err) => {
				if (err) {
					console.log('Error occured loading teams: ', err);
				} else {
					res.render('purchases/index', { purchases, teams });
				}
			});
		}
	});
});

router.post('/new', async (req, res) => {
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
					console.log('Error occurred creating a new purchase: ', err);
				} else {
					console.log('A new purchase has been created: ', purchase);

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
									} else {
										console.log('An existing stock has been updated: ', updatedStock);
									}
								});
							} else {
								// IF NOT EXIST
								await Stock.updateOne(
									{ team_id: req.user.team_id },
									{ $push: { items: item } },
									{ new: true, useFindAndModify: false }
								).then((createdStock, err) => {
									if (err) {
										console.log('Error occured creating stock: ', err);
									} else {
										console.log('A new stock has been created: ', createdStock);
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
