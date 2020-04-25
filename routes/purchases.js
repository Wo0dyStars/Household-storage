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
const Basket = require('../models/basket');

router.get('/', (req, res) => {
	res.send('found.');
});

router.post('/new', async (req, res) => {
	const { quantity, price, id } = req.body;
	const items = [];

	if (quantity && price && id) {
		quantity.forEach((qty, idx) => {
			items.push({
				id: id[idx],
				quantity: qty,
				price: price[idx]
			});
		});

		await Purchase.create(
			{
				user_id: req.user._id,
				items: items
			},
			(err, purchase) => {
				if (err) {
					console.log('Error occurred creating a new purchase: ', err);
				} else {
					console.log('A new purchase has been created: ', purchase);

					// Remove elements from basket
					Basket.deleteOne({ user_id: req.user._id }, (err, basket) => {
						if (err) {
							console.log('Error deleting basket: ', err);
						} else {
							console.log('Basket has been deleted: ', basket);
						}
					});

					req.flash('success', 'You have successfully created a new purchase!');
					res.redirect('back');
				}
			}
		);
	} else {
		req.flash('error', 'You have not added items in your basket.');
		res.redirect('back');
	}
});

module.exports = router;
