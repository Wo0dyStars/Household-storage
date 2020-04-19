// **********************************
// IMPORTS
// **********************************
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Multer = require('multer');
const path = require('path');
const fs = require('fs');

// **********************************
// SCHEMA IMPORTS
// **********************************
const Users = require('../models/items');
const UserQueries = require('../queries/users');
const TeamQueries = require('../queries/teams');

const storage = Multer.diskStorage({
	destination: './public/avatars',
	filename: function(req, file, cb) {
		const uniqueSuffix = Date.now() + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
		cb(null, uniqueSuffix);
	}
});

const Upload = Multer({ storage });

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

router.post('/:id', Upload.single('avatar'), async (req, res) => {
	if (req.body.selectteam) {
		await TeamQueries.AddUserToTeam(req.body.selectteam, req.params.id);
		res.redirect('back');
	}
	if (req.body.createteam) {
		await TeamQueries.createTeam(req.body.createteam, req.params.id);
		res.redirect('back');
	}
	if (req.file) {
		const filepath = '/avatars/' + req.file.filename;
		await UserQueries.updateUser(req.params.id, 'avatar', filepath);

		// Remove old avatar from the local server
		const absfilepath = './public' + req.body.oldavatar;
		fs.unlink(absfilepath, (err) => {
			if (err) {
				console.log(err);
			} else {
				console.log('File ', req.body.oldavatar, ' removed.');
			}
		});

		res.redirect('back');
	}
});

// **********************************
// EXPORTING ROUTER
// **********************************
module.exports = router;
