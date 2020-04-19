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
	const teamname = await TeamQueries.getTeamNameByID(user.team_id);
	const names = await TeamQueries.getTeamNames();
	if (teamname) {
		res.render('users/show', { user, teamname: teamname.name, names });
	} else {
		res.render('users/show', { user, teamname: null, names });
	}
});

router.post('/:id', async (req, res) => {
	if (req.body.selectteam) {
		await TeamQueries.AddUserToTeam(req.body.selectteam, req.params.id);
		res.redirect('back');
	}
	if (req.body.createteam) {
		await TeamQueries.createTeam(req.body.createteam, req.params.id);
		res.redirect('back');
	}
});

// **********************************
// EXPORTING ROUTER
// **********************************
module.exports = router;
