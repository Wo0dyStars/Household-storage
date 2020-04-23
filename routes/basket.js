// **********************************
// IMPORTS
// **********************************
const express = require('express');
const router = express.Router();
const middleware = require('../middleware');

// **********************************
// SCHEMA IMPORTS
// **********************************
const Basket = require('../models/basket');

router.get('/', middleware.isLoggedIn, async (req, res) => {
	await Basket.find({ user_id: req.user._id }).populate('items').then((Basket_, err) => {
		if (err) {
			console.log('Error occurring when retrieving Basket content, ', err);
		} else {
			res.render('basket/', { Basket: Basket_[0] });
		}
	});
});

router.post('/new', middleware.isLoggedIn, async (req, res) => {
	const NewBasket = {
		user_id: req.user._id,
		items: [ req.body.BasketID ]
	};

	await Basket.find({ user_id: req.user._id }).then(async (BasketExist) => {
		if (BasketExist.length) {
			if (BasketExist[0].items.includes(req.body.BasketID)) {
				req.flash('error', 'Item has been added to your basket already.');
				res.redirect('back');
			} else {
				await Basket.findByIdAndUpdate(
					BasketExist[0]._id,
					{ $push: { items: req.body.BasketID } },
					{ new: true, useFindAndModify: false }
				).then((updatedBasket, err) => {
					if (err) {
						console.log('Error occurred adding item to basket: ', err);
					} else {
						console.log('item has been added to basket: ', updatedBasket);
						req.flash('success', 'Item has been added to your basket.');
						res.redirect('back');
					}
				});
			}
		} else {
			await Basket.create(NewBasket).then((newBasket_, err) => {
				if (err) {
					console.log('Error occurred creating new basket: ', err);
				} else {
					console.log('new basket has been created: ', newBasket_);
					req.flash('success', 'A new basket has been created for your item.');
					res.redirect('back');
				}
			});
		}
	});
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
