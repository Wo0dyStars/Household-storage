// ****************************************************
// SCHEMA IMPORTS
// ****************************************************
const Items = require('../models/items');
const Categories = require('../models/categories');
const Users = require('../models/users');
const Teams = require('../models/teams');

const mongoose = require('mongoose');
// ****************************************************
// CREATE A NEW ITEM AND UPDATE CORRESPONDING CATEGORY
// ****************************************************
const createItem = function(category_id, category_name, item) {
	item['category_name'] = category_name;
	return Items.create(item).then((new_item) => {
		console.log('\n>> Created item:\n', new_item);
		console.log('\n>> Category ID:\n', category_id);

		return Categories.findByIdAndUpdate(
			category_id,
			{ $push: { items: new_item._id } },
			{ new: true, useFindAndModify: false }
		);
	});
};

// ****************************************************
// CREATE A NEW USER
// ****************************************************
const createUser = function(user) {
	return Users.create(user).then((new_user) => {
		console.log('\n>> Created user:\n', new_user);
	});
};

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

const DeleteUsers = async function() {
	await Users.find({}, (err, users) => {
		users.forEach((user) => {
			DeleteUserByID(user._id);
		});
	});
};

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

const DeleteTeams = async function() {
	await Teams.find({}, (err, teams) => {
		if (err) console.log(err);
		teams.forEach((team) => {
			DeleteTeamByID(team._id);
		});
	});
};

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

const printTeams = function() {
	return Teams.find({}, (err, teams) => {
		if (err) console.log(err);
		console.log('\n>> Teams:\n', teams);
	});
};

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
// CREATE A NEW CATEGORY
// ****************************************************
const createCategory = function(category) {
	return Categories.create(category).then((new_category) => {
		console.log('\n>> Created category:\n', new_category);
		return new_category;
	});
};

// ****************************************************
// GENERATE CATEGORIES FROM PREDEFINED LIST
// ****************************************************
const CategoryObject = [
	'Frozen',
	'Meat',
	'Dairy',
	'Vegetables and Fruits',
	'Bakery',
	'Drinks and Juices',
	'Pasta, Rice and Noodles',
	'Jams and Spreads',
	'Coffee and Tea',
	'Biscuits, Chocolates and Sweets',
	'Crisps and Nuts'
];

const GenerateCategories = function() {
	CategoryObject.forEach((Category) => {
		createCategory({ name: Category });
	});
};

// ****************************************************
// POPULATE WITH SAMPLE ITEMS
// ****************************************************
const SampleItems = [
	{
		Category: 'Vegetables and Fruits',
		Item: {
			name: 'Brown onion',
			image: 'brown_onion.png',
			quantity: 5,
			reorder_quantity: 1,
			created_at: Date.now()
		}
	},
	{
		Category: 'Meat',
		Item: {
			name: 'Chorizo',
			image: 'chorizo.jfif',
			quantity: 2,
			reorder_quantity: 1,
			created_at: Date.now()
		}
	},
	{
		Category: 'Dairy',
		Item: {
			name: 'Cheddar mature',
			image: 'cheddar_mature.jfif',
			quantity: 1,
			reorder_quantity: 1,
			created_at: Date.now()
		}
	}
];

// ****************************************************
// FIND CATEGORY ID BY CATEGORY NAME
// ****************************************************
const FindCategoryIDByName = function(CategoryName) {
	return Categories.find({ name: CategoryName }, '_id', (err) => {
		if (err) return console.log(err);
	});
};

// ****************************************************
// RUNNING CODE FOR STORING SAMPLE DATA
// ****************************************************
const run = async function() {
	// GenerateCategories();
	// SampleItems.forEach(async (SampleItem) => {
	// 	let CategoryID = await FindCategoryIDByName(SampleItem.Category);
	// 	await createItem(CategoryID, SampleItem.Category, SampleItem.Item);
	// });
	// SampleUsers.forEach(async (SampleUser) => {
	// 	await createUser(SampleUser);
	// });
	// await createTeam('Dream couple', '5e99468dc876782d5c9d3f99');
	//console.log(await Users.findByIdAndUpdate('5e97f6b714a80831a0e943c1', { team_id: 'potato' }));
	// await AddUserToTeam('5e99469f3ded2519c475652b', '5e99468dc876782d5c9d3f98');
	// await DeleteTeams();
	// await printTeams();
	await printUsers();
	// await DeleteUsers();
	// await createTeam('Newest team', '5e9940840d935436d4d2bc8a');
};

// ****************************************************
// RUN THIS STATEMENT ONLY WITH CARE
// ****************************************************
run();

const Create = {
	createItem,
	createCategory,
	FindCategoryIDByName
};

module.exports = Create;
