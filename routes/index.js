// **********************************
// IMPORTS
// **********************************
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/users');
const { validationResult } = require('express-validator');
const Validators = require('../middleware/validators');
const middleware = require('../middleware');

const Stock = require('../models/stock');

// **********************************
// GET ROUTE FOR HANDLING LANDING PAGE
// **********************************
router.get('/', (req, res) => {
	res.render('landing');
});

router.get('/list', middleware.isLoggedIn, async (req, res) => {
	await Stock.find({ team_id: req.user.team_id }).populate('items.id').lean().then((stock, err) => {
		let list = [];
		if (stock && stock.length) {
			stock[0].items.forEach((item) => {
				if (item.reorder_quantity >= item.quantity) {
					list.push(item.id);
				}
			});
		}
		res.render('list', { list });
	});
});

router.get('/register', (req, res) => {
	res.render('register', { data: {}, errors: {} });
});

router.post('/register', [ Validators['register'] ], (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.render('register', {
			data: req.body,
			errors: errors.mapped()
		});
	} else {
		const { firstname, middlename, lastname, email, country } = req.body.register;
		const newUser = new User({
			username: req.body.username,
			firstname: firstname,
			email: email,
			middlename: middlename,
			lastname: lastname,
			country: country,
			joined_at: Date.now()
		});

		User.register(newUser, req.body.password, (err, user) => {
			if (err) {
				req.flash('error', err.message);
				res.redirect('/register');
			} else {
				passport.authenticate('local')(req, res, () => {
					req.flash('success', 'You have successfully registered ', user.username);
					res.redirect('/register');
				});
			}
		});
	}
});

router.post('/login', function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err) {
			req.flash('error', err.message);
			return next(err);
		}
		if (!user) {
			req.flash('error', 'You provided Invalid username or password');
			return res.redirect('/');
		}
		req.logIn(user, function(err) {
			if (err) {
				req.flash('error', err.message);
				return next(err);
			}
			req.flash('success', `Welcome back, ${user.username}!`);
			return res.redirect('/');
		});
	})(req, res, next);
});

router.get('/logout', middleware.isLoggedIn, (req, res) => {
	req.logout();
	req.flash('success', 'You have successfully logged out. See you soon!');
	res.redirect('/');
});

// **********************************
// EXPORTING ROUTER
// **********************************
module.exports = router;
