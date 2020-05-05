const { check, body } = require('express-validator');

const Validators = {
	register: [
		check('username').isLength({ min: 8, max: 20 }).withMessage('Username must be between 8 and 20 characters.'),
		check('register[email]').isEmail().withMessage('Email address must be valid.'),
		check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
	],
	newitem: [
		check('items[name]')
			.isLength({ min: 4, max: 20 })
			.withMessage('Name must be between 4 and 20 characters')
			.trim(),
		check('items[store]')
			.isLength({ min: 4, max: 20 })
			.withMessage('Store must be between 4 and 20 characters')
			.trim()
	]
};

module.exports = Validators;
