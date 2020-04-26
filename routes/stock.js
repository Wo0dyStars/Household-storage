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
const Users = require('../models/users');

router.get('/', async (req, res) => {
	if (req.user) {
		const TeamID = await Users.findById(req.user._id, 'team_id').then((user) => {
			return user.team_id;
		});

		await Stock.find({ team_id: TeamID }).populate('items.id').then((stock, err) => {
			if (err) {
				console.log('Error occured loading stock data: ', err);
			} else {
				res.render('stock/index', { stock });
			}
		});
	} else {
		console.log('User is not found.');
		res.render('stock/index', { stock: null });
	}
});

router.post('/new', middleware.isLoggedIn, async (req, res) => {
	const TeamID = await Users.findById(req.user._id, 'team_id').then((user) => {
		return user.team_id;
	});

	const StockItem = {
		id: req.body.StockID,
		quantity: 1,
		reorder_quantity: 0
	};

	await Stock.find({ team_id: TeamID }).then(async (found_team) => {
		if (found_team.length) {
			// UPDATE
			await Stock.find({ 'items.id': req.body.StockID, team_id: TeamID }).then(async (found_item) => {
				if (!found_item.length) {
					// ITEM DOES NOT EXIST IN STOCK
					await Stock.updateOne(
						{ team_id: TeamID },
						{ $push: { items: StockItem } },
						{ new: true, useFindAndModify: false }
					).then((updated_stock, err) => {
						if (err) {
							console.log('Error occured updating stock: ', err);
						} else {
							console.log('An existing stock has been updated: ', updated_stock);
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
				team_id: TeamID,
				items: [ StockItem ]
			}).then((stock, err) => {
				if (err) {
					console.log('Error occured creating stock: ', err);
				} else {
					console.log('A new stock has been added: ', stock);
					req.flash('success', 'You have successfully added this item to your stock.');
					res.redirect('back');
				}
			});
		}
	});
});

router.post('/edit', async (req, res) => {
	const TeamID = await Users.findById(req.user._id, 'team_id').then((user) => {
		return user.team_id;
	});

	Items = req.body.item;
	let Modified = 0;
	await Items.forEach((item, idx) => {
		Stock.updateOne(
			{ team_id: TeamID, 'items.id': item[0] },
			{ $set: { 'items.$.quantity': item[1], 'items.$.reorder_quantity': item[2] } }
		).then((updated_stock, err) => {
			if (err) {
				console.log('Error occured updating values in stock: ', err);
			} else {
				console.log('Details have been updated in stock. ', updated_stock);
				if (updated_stock.nModified === 1) {
					Modified++;
				}
			}

			if (idx === Items.length - 1) {
				console.log('modified: ', Modified);
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

module.exports = router;
