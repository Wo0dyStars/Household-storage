// ****************************************************
// SCHEMA IMPORTS
// ****************************************************
const Items = require('../models/items');
const Categories = require('../models/categories');
const Users = require('../models/users');

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
// CREATE A NEW USER AND UPDATE CORRESPONDING TEAM
// ****************************************************
const createUser = function(user, team_name = 'undefined', team_id = 'undefined') {
	return Users.create(user).then((new_user) => {
		console.log('\n>> Created user:\n', new_user);

		if (team_id !== 'undefined') {
			console.log('\n>> Team ID:\n', team_id);
			user['team_name'] = team_name;
			return Teams.findByIdAndUpdate(
				team_id,
				{ $push: { users: new_user._id } },
				{ new: true, useFindAndModify: false }
			);
		}
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

	SampleUsers.forEach(async (SampleUser) => {
		await createUser(SampleUser);
	});
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
