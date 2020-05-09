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
const Teams = require('../models/teams');

const storage = Multer.diskStorage({
	destination: './public/avatars',
	filename: function(req, file, cb) {
		const uniqueSuffix = Date.now() + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
		cb(null, uniqueSuffix);
	}
});

const Upload = Multer({ storage });

// *******************************************
// SHOW ALL USERS
// *******************************************
router.get('/', async (req, res) => {
	const users = await Users.find({}).sort({ username: 1 }).then((users, err) => {
		if (err) {
			req.flash('error', 'An error occurred loading users data.');
			res.redirect('back');
		} else {
			return users;
		}
	});

	const names = await Teams.find({}, 'name').then((teams, err) => {
		if (err) {
			req.flash('error', 'An error occurred loading teams data.');
			res.redirect('back');
		} else {
			return teams;
		}
	});
	res.render('users', { users, teamnames: names });
});

// *******************************************
// SHOW SELECTED USER PROFILE
// *******************************************
router.get('/:id', async (req, res) => {
	if (mongoose.Types.ObjectId.isValid(req.params.id)) {
		await Users.findById(req.params.id).then(async (user, err) => {
			if (err) {
				req.flash('error', 'Selected user is not in the database');
				res.redirect('back');
			} else {
				const teamname = await Teams.findById(user.team_id, 'name').then((teamname) => {
					return teamname;
				});

				// FIND TEAM NAMES
				const names = await Teams.find({}, 'name').then((teams) => {
					return teams;
				});

				// CHECK IF THERE ARE ONGOING REQUESTS
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

				// FIND PURCHASES
				const purchases = await Purchase.find({ user_id: req.params.id }).then((userPurchases) => {
					return userPurchases;
				});

				// FIND FAVOURITE ITEMS
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
			}
		});
	} else {
		req.flash('error', 'Selected user is not in the database');
		res.redirect('back');
	}
});

// *******************************************
// REQUEST TEAM MEMBERSHIP OR CREATE NEW TEAM
// *******************************************
router.post('/:id', middleware.isLoggedIn, async (req, res) => {
	// USER SELECTS AN EXISTING TEAM
	if (req.body.selectteam) {
		await Teams.findById(req.body.selectteam).then(async (SelectedTeam, err) => {
			if (err) {
				req.flash('error', 'Selected team does not exist in the database.');
				res.redirect('back');
			} else {
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

				// WHEN REQUESTED ALREADY
				if (isContain) {
					req.flash('error', 'You have already sent request to a team.');
					res.redirect('back');
				} else {
					await Teams.findByIdAndUpdate(
						req.body.selectteam,
						{ $push: { requests: Request } },
						{ new: true, useFindAndModify: false }
					).then((Requested, err) => {
						if (err) {
							req.flash('error', 'An error occurred selecting your team.');
							res.redirect('back');
						} else {
							req.flash('success', 'You have successfully selected your team.');
							res.redirect('back');
						}
					});
				}
			}
		});
	}

	// USER CREATES NEW TEAM
	if (req.body.createteam) {
		const team = {
			name: req.body.createteam,
			users: [ req.params.id ],
			created_at: Date.now()
		};
		await Teams.create(team).then(async (new_team, err) => {
			if (err) {
				req.flash('error', 'An error occurred creating a new team.');
				res.redirect('back');
			} else {
				await Users.findByIdAndUpdate(req.params.id, { team_id: new_team._id }).then((updated_user, err) => {
					if (err) {
						req.flash('error', 'An error occurred updating your user details.');
						res.redirect('back');
					} else {
						req.flash('success', 'You have successfully created a new team.');
						res.redirect('back');
					}
				});
			}
		});
	}
});

// ******************************************
// ACCEPT OR REJECT TEAM MEMBERSHIP REQUESTS
// ******************************************
router.post('/:id/request', middleware.isLoggedIn, async (req, res) => {
	// USER ACCEPTED REQUEST
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
					req.flash('success', 'You have successfully accepted this user.');
				}
			});
		}
	}

	// USER REJECTED REQUEST
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
			).then((rejected, err) => {
				if (err) {
					req.flash('error', 'An error occurred updating request.');
					res.redirect('back');
				} else {
					req.flash('success', 'You have successfully rejected this user.');
				}
			});
		}
	}

	await Teams.findById(req.user.team_id, 'requests').then(async (requested) => {
		let AllSelected = true;
		let AllAccepted = true;
		requested.requests[0].acceptedBy.forEach((user) => {
			if (user.selected === false) {
				AllSelected = false;
			}
			if (user.selected === false || user.accepted === false) {
				AllAccepted = false;
			}
		});

		if (AllSelected) {
			// DECISION HAS BEEN MADE
			if (AllAccepted) {
				// user joins team
				// await TeamQueries.AddUserToTeam(req.user.team_id, requested.requests[0].user_id);
				await Teams.findByIdAndUpdate(
					req.user.team_id,
					{ $push: { users: requested.requests[0].user_id } },
					{ new: true, useFindAndModify: false }
				).then(async (saved_user, err) => {
					if (err) {
						req.flash('error', 'An error occurred saving your data in the team.');
						res.redirect('back');
					} else {
						await Users.findByIdAndUpdate(requested.requests[0].user_id, {
							team_id: req.user.team_id
						}).then(async (saved_team, err) => {
							if (err) {
								req.flash('error', 'An error occurred saving team data for you.');
								res.redirect('back');
							}
						});
					}
				});
			}

			await Teams.findByIdAndUpdate(req.user.team_id, {
				$pull: { requests: { user_id: requested.requests[0].user_id } }
			}).then((removed_request, err) => {
				if (err) {
					req.flash('error', 'An error occurred removing requests.');
					res.redirect('back');
				} else {
					res.redirect('back');
				}
			});
		} else {
			res.redirect('back');
		}
	});
});

// **************************************
// UPLOAD A NEW AVATAR FROM USER PROFILE
// **************************************
router.post('/:id/edit', middleware.isLoggedIn, Upload.single('avatar'), async (req, res) => {
	// AVATAR HAS BEEN UPLOADED
	if (req.file) {
		if (!req.file.originalname.match(/\.(jpg|JPG|jfif|JFIF|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
			// NOT AN IMAGE FILE WAS SELECTED
			req.flash('error', 'Only image files are allowed for update.');
			res.redirect('back');
		} else {
			const filepath = '/avatars/' + req.file.filename;
			await Users.updateOne({ _id: req.params.id }, { $set: { avatar: filepath } }, (err, updateduser) => {
				if (err) {
					req.flash('error', 'Error occurred while updating your avatar.');
					res.redirect('back');
				} else {
					// REMOVE OLD AVATAR FROM SERVER BUT KEEP STANDARD AVATAR
					if (req.body.oldavatar !== '/avatars/no-avatar.png') {
						const absfilepath = './public' + req.body.oldavatar;
						fs.unlink(absfilepath, (err) => {
							if (err) {
								req.flash('error', 'Error occurred while removing your old avatar.');
								res.redirect('back');
							} else {
								req.flash('success', 'You have successfully changed your avatar.');
								res.redirect('back');
							}
						});
					}
				}
			});
		}
	} else {
		// SAVE BUTTON WAS CLICKED WITH NO SELECTION
		req.flash('error', 'You have not selected new avatar.');
		res.redirect('back');
	}
});

// **********************************
// EXPORTING ROUTER
// **********************************
module.exports = router;
