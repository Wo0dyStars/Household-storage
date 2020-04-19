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
	res.render('users', { users, teamnames: names });
});

router.get('/:id', async (req, res) => {
	const user = await UserQueries.getUserByID(req.params.id);
	res.render('users/show', { user });
});

// **********************************
// EXPORTING ROUTER
// **********************************
module.exports = router;
