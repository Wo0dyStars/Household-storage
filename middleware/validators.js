const { check, body } = require('express-validator');

const Validators = {
	register: [
		check('username').isLength({ min: 8, max: 20 }).withMessage('Username must be between 8 and 20 characters.'),
		check('register[email]').isEmail().withMessage('Email address must be valid.'),
		check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
	],
	newitem: [
		check('items[name]')
			.isLength({ min: 5, max: 20 })
			.withMessage('Name must be between 5 and 20 characters')
			.trim(),
		body('items[quantity]').custom((value) => {
			if (value < 1) {
				return Promise.reject('Quantity must be at least 1');
			} else {
				return Promise.resolve();
			}
		}),
		body('items[reorder_quantity]').custom((value) => {
			if (value < 1) {
				return Promise.reject('Reorder quantity must be at least 1');
			} else {
				return Promise.resolve();
			}
		})
	]
};

module.exports = Validators;
