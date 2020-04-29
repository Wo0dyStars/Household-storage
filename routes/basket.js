// **********************************
// IMPORTS
// **********************************
const express = require('express');
const router = express.Router();
const middleware = require('../middleware');

router.get('/', middleware.isLoggedIn, async (req, res) => {
	if (req.session.baskets && req.session.baskets.length) {
		let foundUser = false;
		req.session.baskets.forEach((basket) => {
			if (basket.id.equals(req.user._id)) {
				foundUser = true;
				res.render('basket/', { Basket: basket });
			}
		});

		if (!foundUser) {
			res.render('basket/', { Basket: null });
		}
	} else {
		res.render('basket/', { Basket: null });
	}
});

router.post('/confirm', middleware.isLoggedIn, async (req, res) => {
	if (req.session.baskets && req.session.baskets.length) {
		let foundUser = false;
		req.session.baskets.forEach((basket) => {
			if (basket.id.equals(req.user._id)) {
				foundUser = true;
				res.render('basket/confirm', { Basket: basket });
			}
		});

		if (!foundUser) {
			res.render('basket/confirm', { Basket: null });
		}
	} else {
		res.render('basket/confirm', { Basket: null });
	}
});

router.post('/new', middleware.isLoggedIn, async (req, res) => {
	const { ID, Name, Image } = req.body.Item;
	const newItem = {
		id: ID,
		name: Name,
		image: Image
	};

	if (!req.session.baskets) {
		req.session.baskets = [];
		req.session.baskets.push({
			id: req.user._id,
			items: [ newItem ]
		});
		req.flash('success', 'A new basket has been created for your item.');
		res.redirect('back');
	} else {
		let foundUser = false;
		req.session.baskets.forEach((basket) => {
			if (basket.id.equals(req.user._id)) {
				foundUser = true;
				let foundItem = false;
				basket.items.forEach((item) => {
					if (item.id === newItem.id) {
						foundItem = true;
						req.flash('error', 'Item has been added to your basket already.');
						res.redirect('back');
					}
				});

				if (!foundItem) {
					basket.items.push(newItem);
					req.flash('success', 'Item has been added to your basket.');
					res.redirect('back');
				}
			}
		});

		if (!foundUser) {
			req.session.baskets.push({
				id: req.user._id,
				items: [ newItem ]
			});
			req.flash('success', 'A new basket has been created for your item.');
			res.redirect('back');
		}
	}
});

router.delete('/:id', async (req, res) => {
	await Basket.updateOne({ user_id: req.user._id }, { $pull: { items: req.params.id } }, (err, RemovedItem) => {
		if (err) {
			console.log('Error occurred removing item ', err);
		} else {
			console.log('Item has been removed from basket.', RemovedItem);
		}
	});
	res.redirect('/basket');
});

// **********************************
// EXPORTING ROUTER
// **********************************
module.exports = router;
