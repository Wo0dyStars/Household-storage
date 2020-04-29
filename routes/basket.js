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

	// await Basket.find({ user_id: req.user._id }).populate('items').then((Basket_, err) => {
	// 	if (err) {
	// 		console.log('Error occurring when retrieving Basket content, ', err);
	// 	} else {
	// 		let sessionBasket = {};
	// 		if (req.session.baskets) {
	// 			req.session.baskets.forEach((basket) => {
	// 				if (basket.id.equals(req.user._id)) {
	// 					console.log(basket);
	// 					sessionBasket = basket;
	// 				}
	// 			});
	// 		}
	// 		res.render('basket/', { Basket: Basket_[0], basket1: sessionBasket });
	// 	}
	// });
});

router.post('/new', middleware.isLoggedIn, async (req, res) => {
	const { ID, Name, Image } = req.body.Item;
	console.log('itemID: ', ID, 'name: ', Name, 'image: ', Image);
	const newItem = {
		id: ID,
		name: Name,
		image: Image
	};
	// const NewBasket = {
	// 	user_id: req.user._id,
	// 	items: [ itemID ]
	// };

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
			console.log('BASKET ID: ', basket.id);
			console.log('req.user._id: ', req.user._id);
			console.log('CHECK USER: ', basket.id.equals(req.user._id));
			if (basket.id.equals(req.user._id)) {
				foundUser = true;
				console.log('CHECK ITEMS: ', basket.items.includes(newItem.id));
				let foundItem = false;
				basket.items.forEach((item) => {
					console.log('ITEM ID: ', typeof item.id);
					console.log('new item id: ', typeof newItem.id);
					if (item.id === newItem.id) {
						foundItem = true;
						req.flash('error', 'Item has been added to your basket already.');
						res.redirect('back');
					}
				});

				if (!foundItem) {
					console.log('PUSH ITEMS: ', basket.items.includes(newItem.id));
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

	// await Basket.find({ user_id: req.user._id }).then(async (BasketExist) => {
	// 	if (BasketExist.length) {
	// 		if (BasketExist[0].items.includes(itemID)) {
	// 			req.flash('error', 'Item has been added to your basket already.');
	// 			res.redirect('back');
	// 		} else {
	// 			await Basket.findByIdAndUpdate(
	// 				BasketExist[0]._id,
	// 				{ $push: { items: itemID } },
	// 				{ new: true, useFindAndModify: false }
	// 			).then((updatedBasket, err) => {
	// 				if (err) {
	// 					console.log('Error occurred adding item to basket: ', err);
	// 				} else {
	// 					console.log('item has been added to basket: ', updatedBasket);
	// 					req.session.baskets.forEach((basket) => {
	// 						if (basket.id.equals(req.user._id)) {
	// 							basket.items.push({ id: itemID, name, image });
	// 						}
	// 					});
	// 					req.flash('success', 'Item has been added to your basket.');
	// 					res.redirect('back');
	// 				}
	// 			});
	// 		}
	// 	} else {
	// 		await Basket.create(NewBasket).then((newBasket_, err) => {
	// 			if (err) {
	// 				console.log('Error occurred creating new basket: ', err);
	// 			} else {
	// 				console.log('new basket has been created: ', newBasket_);
	// 				req.session.baskets.push({
	// 					id: req.user._id,
	// 					items: [ { id: itemID, name, image } ]
	// 				});
	// 				req.flash('success', 'A new basket has been created for your item.');
	// 				res.redirect('back');
	// 			}
	// 		});
	// 	}
	// });
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
