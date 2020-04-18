// ****************************************************
// SCHEMA IMPORTS
// ****************************************************
const Users = require('../models/users');
const Teams = require('../models/teams');

// ****************************************************
// CREATE A NEW TEAM FOR A SPECIFIC USER
// ****************************************************
const createTeam = function(team_name, user_id) {
	const team = {
		name: team_name,
		users: [ user_id ],
		created_at: Date.now()
	};
	return Teams.create(team).then((new_team) => {
		console.log(user_id, '\nhas just created the team:\n', new_team);

		return Users.findByIdAndUpdate(user_id, { team_id: new_team._id }).then((err, updated_user) => {
			if (err) {
				console.log(err);
			} else {
				console.log('User ID ', user_id, ' has been updated with Team ID ', new_team._id);
			}
		});
	});
};

// ****************************************************
// ADD A USER TO A SPECIFIED TEAM
// ****************************************************
const AddUserToTeam = function(team_id, user_id) {
	return Teams.findByIdAndUpdate(
		team_id,
		{ $push: { users: user_id } },
		{ new: true, useFindAndModify: false }
	).then((err, updatedTeam) => {
		if (err) console.log(err);
		console.log('Added user ID ', user_id, ' to team ', updatedTeam);

		return Users.findByIdAndUpdate(user_id, { team_id: team_id }).then((err, updated_user) => {
			if (err) {
				console.log(err);
			} else {
				console.log('User ID ', user_id, ' has been updated to ', updated_user);
			}
		});
	});
};

// ****************************************************
// DELETE ALL TEAMS
// ****************************************************
const DeleteTeams = async function() {
	await Teams.find({}, (err, teams) => {
		if (err) console.log(err);
		teams.forEach((team) => {
			DeleteTeamByID(team._id);
		});
	});
};

// ****************************************************
// DELETE A TEAM BY ID
// ****************************************************
const DeleteTeamByID = function(TeamID) {
	return Teams.deleteOne({ _id: TeamID }, (err, team) => {
		if (err) console.log(err);
		console.log('\n>> Team deleted.\n');

		// Delete Team ID from corresponding users
		if (team.users) {
			team.users.forEach((UserID) => {
				Users.findByIdAndUpdate(UserID, { $pull: { team_id: null } }, (err) => {
					if (err) console.log(err);
				});
			});
		}
	});
};

// ****************************************************
// PRINT ALL TEAMS
// ****************************************************
const printTeams = function() {
	return Teams.find({}, (err, teams) => {
		if (err) console.log(err);
		console.log('\n>> Teams:\n', teams);
	});
};

const run = async function() {
	// await DeleteTeams();
	await printTeams();
	//await AddUserToTeam('5e99469f3ded2519c475652b', '5e9b182dd94263395ca0a91d');
};

// ****************************************************
// RUN THIS STATEMENT ONLY WITH CARE
// ****************************************************
// run();

// ****************************************************
// EXPORTING TEAM QUERIES
// ****************************************************
module.exports = {
	createTeam,
	AddUserToTeam,
	DeleteTeams,
	DeleteTeamByID,
	printTeams
};
