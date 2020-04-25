// **********************************
// IMPORTS
// **********************************
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/users');
const { validationResult } = require('express-validator');
const Validators = require('../middleware/validators');

const Basket = require('../models/basket');

const isLoggedIn = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash('error', 'You must be logged in to do that.');
	res.redirect('/login');
};

// **********************************
// GET ROUTE FOR HANDLING LANDING PAGE
// **********************************
router.get('/', isLoggedIn, (req, res) => {
	res.render('landing');
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

router.get('/login', (req, res) => {
	res.render('login');
});

router.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/login'
	}),
	(req, res) => {}
);

router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success', 'Logged you out!');
	res.redirect('/login');
});

// **********************************
// EXPORTING ROUTER
// **********************************
module.exports = router;
