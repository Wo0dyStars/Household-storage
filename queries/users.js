// ****************************************************
// SCHEMA IMPORTS
// ****************************************************
const Users = require('../models/users');
const Teams = require('../models/teams');

// ****************************************************
// CREATE A NEW USER
// ****************************************************
const createUser = function(user) {
	return Users.create(user).then((new_user) => {
		console.log('\n>> Created user:\n', new_user);
	});
};

// ****************************************************
// DELETE ALL USERS
// ****************************************************
const DeleteUsers = async function() {
	await Users.find({}, (err, users) => {
		users.forEach((user) => {
			DeleteUserByID(user._id);
		});
	});
};

// ****************************************************
// DELETE A USER BY ID
// ****************************************************
const DeleteUserByID = function(UserID) {
	return Users.deleteOne({ _id: UserID }, (err) => {
		if (err) console.log(err);
		console.log('\n>> User deleted.\n');

		// Delete User ID from corresponding team
		Teams.updateMany({ users: UserID }, { $pull: { users: UserID } }, (err) => {
			if (err) console.log(err);
		});
	});
};

// ****************************************************
// PRINT ALL USERS
// ****************************************************
const printUsers = function() {
	return Users.find({}, (err, users) => {
		if (err) console.log(err);
		console.log('\n>> Users:\n', users);
	});
};

// ****************************************************
// NEW USERS WITH SAMPLE DATA
// ****************************************************
const SampleUsers = [
	{
		firstname: 'Peter',
		middlename: '',
		lastname: 'Kertesz',
		email: 'kerteszpetr@gmail.com',
		password: 'password',
		joined_at: Date.now()
	},
	{
		firstname: 'Nikolett',
		middlename: 'Alexandra',
		lastname: 'Nemes',
		email: 'nyikkanoble@gmail.com',
		password: 'password',
		joined_at: Date.now()
	}
];

// ****************************************************
// RUNNING CODE
// ****************************************************
const run = async function() {
	SampleUsers.forEach(async (SampleUser) => {
		await createUser(SampleUser);
	});
	await printUsers();
	await DeleteUsers();
};

// ****************************************************
// RUN THIS STATEMENT ONLY WITH CARE
// ****************************************************
// run();

// ****************************************************
// EXPORTING USER QUERIES
// ****************************************************
module.exports = {
	createUser,
	DeleteUsers,
	DeleteUserByID,
	printUsers
};
