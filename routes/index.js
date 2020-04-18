// **********************************
// IMPORTS
// **********************************
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/users');

// **********************************
// GET ROUTE FOR HANDLING LANDING PAGE
// **********************************
router.get('/', (req, res) => {
	res.render('landing');
});

router.get('/register', (req, res) => {
	res.render('register');
});

router.post('/register', (req, res) => {
	const newUser = new User({ username: req.body.username });
	User.register(newUser, req.body.password, (err, user) => {
		if (err) {
			req.flash('error', err.message);
			return res.render('register', { error: err.message });
		} else {
			passport.authenticate('local')(req, res, () => {
				req.flash('success', 'You have successfully registered ', user.username);
				res.redirect('/register');
			});
		}
	});
});

// **********************************
// EXPORTING ROUTER
// **********************************
module.exports = router;
