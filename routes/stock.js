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

module.exports = router;
