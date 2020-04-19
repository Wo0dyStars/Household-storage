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
const TeamQueries = require('../queries/teams');

router.get('/', async (req, res) => {
	const users = await UserQueries.getUsers();
	const names = await TeamQueries.getTeamNames();
	console.log(names[0]);
	res.render('users', { users, teamnames: names });
});

// **********************************
// EXPORTING ROUTER
// **********************************
module.exports = router;
