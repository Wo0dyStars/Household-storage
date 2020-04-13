// ****************************************************
// SCHEMA IMPORTS
// ****************************************************
const Categories = require('../models/categories');

// ****************************************************
// RETRIEVE CATEGORY BY CATEGORY ID WITH POPULATE
// ****************************************************
const getCategoryByID = function(category_id) {
	return Categories.findById(category_id).populate('items');
};

// ****************************************************
// RETRIEVE ALL CATEGORIES
// ****************************************************
const getCategoryAll = function() {
	return Categories.find({}, (err, categories) => {
		if (err) console.log(err);
		console.log('\n>> Categories:\n', categories);
	});
};

// ****************************************************
// DELETE ALL CATEGORIES
// ****************************************************
const DeleteCategoryAll = function() {
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

const run = async function() {
	//var DeletedCategories = await DeleteCategoryAll();
	var categories = await getCategoryAll();
};

// ****************************************************
// RUN THIS STATEMENT ONLY WITH CARE
// ****************************************************
run();
