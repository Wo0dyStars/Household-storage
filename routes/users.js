// **********************************
// IMPORTS
// **********************************
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// **********************************
// SCHEMA IMPORTS
// **********************************
const Users = require('../models/items');
const UserQueries = require('../queries/users');

router.get('/', async (req, res) => {
	const users = await UserQueries.getUsers();
	res.render('users', { users });
});

// **********************************
// EXPORTING ROUTER
// **********************************
module.exports = router;
