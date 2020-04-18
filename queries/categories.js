// ****************************************************
// SCHEMA IMPORTS
// ****************************************************
const Categories = require('../models/categories');

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
// PRINT CATEGORY BY CATEGORY ID WITH POPULATE
// ****************************************************
const printCategoryByID = function(category_id) {
	return Categories.findById(category_id).populate('items');
};

// ****************************************************
// PRINT ALL CATEGORIES
// ****************************************************
const printCategories = function() {
	return Categories.find({}, (err, categories) => {
		if (err) console.log(err);
		console.log('\n>> Categories:\n', categories);
	});
};

// ****************************************************
// DELETE ALL CATEGORIES
// ****************************************************
const DeleteCategories = function() {
	return Categories.deleteMany({}, (err) => {
		if (err) console.log(err);
		console.log('\n>> Categories deleted.\n');
	});
};

// ****************************************************
// DELETE CATEGORY BY CATEGORY ID
// ****************************************************
const DeleteCategoryByID = function(CategoryID) {
	return Categories.deleteOne({ _id: CategoryID }, (err) => {
		if (err) console.log(err);
		console.log('\n>> Category deleted.\n');
	});
};

// ****************************************************
// FIND CATEGORY ID BY CATEGORY NAME
// ****************************************************
const FindCategoryIDByName = function(CategoryName) {
	return Categories.find({ name: CategoryName }, '_id', (err) => {
		if (err) return console.log(err);
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
// RUNNING CODE
// ****************************************************
const run = async function() {
	// GenerateCategories();
	// await DeleteCategories();
	await printCategories();
};

// ****************************************************
// RUN THIS STATEMENT ONLY WITH CARE
// ****************************************************
// run();

// ****************************************************
// EXPORTING CATEGORY QUERIES
// ****************************************************
module.exports = {
	createCategory,
	printCategoryByID,
	printCategories,
	DeleteCategories,
	DeleteCategoryByID,
	FindCategoryIDByName
};
