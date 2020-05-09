const { check, body } = require('express-validator');

const Validators = {
	register: [
		check('username').isLength({ min: 4, max: 20 }).withMessage('Username must be between 4 and 20 characters.'),
		check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
		check('register[email]').isEmail().withMessage('Email address must be valid, for example: "email@email.com".'),
		check('register[firstname]').isLength({ min: 2 }).withMessage('First name must be at least 2 characters.'),
		check('register[lastname]').isLength({ min: 2 }).withMessage('Last name must be at least 2 characters.')
	],
	newitem: [
		check('items[name]')
			.isLength({ min: 4, max: 30 })
			.withMessage('Name must be between 4 and 30 characters')
			.trim(),
		check('items[store]')
			.isLength({ min: 4, max: 20 })
			.withMessage('Store must be between 4 and 20 characters')
			.trim()
	]
};

module.exports = Validators;
