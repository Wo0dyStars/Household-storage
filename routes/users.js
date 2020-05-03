// **********************************
// IMPORTS
// **********************************
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Multer = require('multer');
const path = require('path');
const fs = require('fs');
const middleware = require('../middleware');
const _ = require('lodash');

// **********************************
// SCHEMA IMPORTS
// **********************************
const Users = require('../models/users');
const Purchase = require('../models/purchases');
const Items = require('../models/items');
const Teams = require('../models/teams');
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
	await Teams.find({}, 'requests').then((found) => {
		console.log(found);
	});
	const users = await UserQueries.getUsers();
	const names = await TeamQueries.getTeamNames();
	res.render('users', { users, teamnames: names });
});

router.get('/:id', async (req, res) => {
	if (mongoose.Types.ObjectId.isValid(req.params.id)) {
		const user = await UserQueries.getUserByID(req.params.id);

		if (user) {
			const teamname = await TeamQueries.getTeamNameByID(user.team_id);
			const names = await TeamQueries.getTeamNames();
			const teamRequests = await Teams.findById(user.team_id, 'requests').then(async (requests) => {
				let requestUsers = [];
				let selected = [];
				if (requests) {
					requests.requests.forEach((request) => {
						requestUsers.push(request.user_id);
						request.acceptedBy.forEach((user) => {
							if (user.user_id.equals(req.params.id)) {
								selected.push({
									user_id: request.user_id,
									selected: user.selected,
									accepted: user.accepted
								});
							}
						});
					});
				}

				const requested = await Users.find().where('_id').in(requestUsers).select('username').lean().exec();

				requested.forEach((request) => {
					selected.forEach((select) => {
						if (request._id.equals(select.user_id)) {
							request.selected = select.selected;
							request.accepted = select.accepted;
						}
					});
				});

				return requested;
			});
			const purchases = await Purchase.find({ user_id: req.params.id }).then((userPurchases) => {
				return userPurchases;
			});
			const Sorteditems = await Purchase.find({ user_id: req.params.id })
				.populate('items.id')
				.then((purchases) => {
					let FilteredItems = [];
					purchases.forEach((purchase) => {
						purchase.items.forEach((item) => {
							FilteredItems.push({
								id: item.id._id,
								name: item.id.name,
								image: item.id.image,
								qty: item.quantity
							});
						});
					});
					return _(FilteredItems)
						.groupBy('id')
						.map((objs, key) => ({
							id: key,
							name: objs[0].name,
							image: objs[0].image,
							qty: _.sumBy(objs, 'qty')
						}))
						.orderBy('qty', 'desc')
						.value()
						.splice(0, 3);
				});

			const onRequest = await Teams.find({}).then((requests) => {
				let foundRequest;
				if (requests.length) {
					requests.forEach((request) => {
						request.requests.forEach((user) => {
							if (user.user_id.equals(req.params.id)) {
								foundRequest = request.name;
							}
						});
					});
				}
				return foundRequest;
			});

			if (teamname) {
				res.render('users/show', {
					user,
					teamname: teamname.name,
					names,
					purchases,
					favItems: Sorteditems,
					teamRequests,
					onRequest
				});
			} else {
				res.render('users/show', {
					user,
					teamname: null,
					names,
					purchases,
					favItems: Sorteditems,
					teamRequests,
					onRequest
				});
			}
		} else {
			req.flash('error', 'User is not in the database');
			res.redirect('/login');
		}
	} else {
		req.flash('error', 'User is not in the database');
		res.redirect('/users');
	}
});

router.post('/:id', middleware.isLoggedIn, Upload.single('avatar'), async (req, res) => {
	if (req.body.AcceptRequest) {
		if (req.user) {
			await Teams.updateOne(
				{
					_id: req.user.team_id,
					'requests.user_id': req.body.AcceptRequest
				},
				{
					$set: {
						'requests.$[].acceptedBy.$[user].accepted': true,
						'requests.$[].acceptedBy.$[user].selected': true
					}
				},
				{
					arrayFilters: [ { 'user.user_id': req.user._id } ]
				}
			).then(async (updatedRequest, err) => {
				if (err) {
					req.flash('error', 'An error occurred updating request.');
					res.redirect('back');
				} else {
					await Teams.findById(req.user.team_id, 'requests').then(async (requested) => {
						let AllSelected = true;
						let AllAccepted = true;
						console.log(requested.requests[0].acceptedBy);
						requested.requests[0].acceptedBy.forEach((user) => {
							if (user.selected === false) {
								AllSelected = false;
							}
							if (user.selected === false || user.accepted === false) {
								AllAccepted = false;
							}
						});

						if (AllSelected) {
							// Decision has been made
							if (AllAccepted) {
								// user joins team
								await TeamQueries.AddUserToTeam(req.user.team_id, requested.requests[0].user_id);
							}

							// Remove request
							console.log('request id: ', requested.requests[0].user_id);
							await Teams.findByIdAndUpdate(req.user.team_id, {
								$pull: { requests: { user_id: requested.requests[0].user_id } }
							}).then((DeletedRequest) => {
								console.log('Request has been deleted: ', DeletedRequest);
							});
						}
					});
					req.flash('success', 'You have accepted this user.');
					res.redirect('back');
				}
			});
		}
	}
	if (req.body.RejectRequest) {
		if (req.user) {
			await Teams.updateOne(
				{
					_id: req.user.team_id,
					'requests.user_id': req.body.RejectRequest
				},
				{
					$set: {
						'requests.$[].acceptedBy.$[user].accepted': false,
						'requests.$[].acceptedBy.$[user].selected': true
					}
				},
				{
					arrayFilters: [ { 'user.user_id': req.user._id } ]
				}
			).then((updatedRequest, err) => {
				if (err) {
					req.flash('error', 'An error occurred updating request.');
					res.redirect('back');
				} else {
					req.flash('success', 'You have rejected this user.');
					res.redirect('back');
				}
			});
		}
	}
	if (req.body.selectteam) {
		await Teams.findById(req.body.selectteam).then((SelectedTeam) => {
			console.log(SelectedTeam);
		});
		await Teams.findById(req.body.selectteam).then(async (SelectedTeam) => {
			// CREATE
			let acceptedBy = [];
			SelectedTeam.users.forEach((user) => {
				acceptedBy.push({
					user_id: user,
					accepted: false
				});
			});
			Request = {
				user_id: req.params.id,
				acceptedBy: acceptedBy
			};
			// CHECK IF REQUESTED
			isContain = false;
			await Teams.find({}).then(async (AllTeam) => {
				AllTeam.forEach((team) => {
					if (team.requests) {
						team.requests.forEach((request) => {
							if (request.user_id.equals(req.params.id)) {
								isContain = true;
							}
						});
					}
				});
			});
			if (isContain) {
				console.log('You have already sent request to a team.');
				req.flash('error', 'You have already sent request to a team.');
				res.redirect('back');
			} else {
				await Teams.findByIdAndUpdate(
					req.body.selectteam,
					{ $push: { requests: Request } },
					{ new: true, useFindAndModify: false }
				).then((Requested, err) => {
					if (err) {
						console.log(err);
					} else {
						console.log(Requested);
						res.redirect('back');
					}
				});
			}
		});
	}
	if (req.body.createteam) {
		await TeamQueries.createTeam(req.body.createteam, req.params.id);
		res.redirect('back');
	}
	if (req.file) {
		const filepath = '/avatars/' + req.file.filename;
		await UserQueries.updateUser(req.params.id, 'avatar', filepath);

		// Remove old avatar from the local server
		if (req.body.oldavatar !== '/avatars/no-avatar.png') {
			const absfilepath = './public' + req.body.oldavatar;
			fs.unlink(absfilepath, (err) => {
				if (err) {
					console.log(err);
				} else {
					console.log('File ', req.body.oldavatar, ' removed.');
				}
			});
		}

		res.redirect('back');
	}
});

// **********************************
// EXPORTING ROUTER
// **********************************
module.exports = router;
