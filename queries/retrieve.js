// ****************************************************
// SCHEMA IMPORTS
// ****************************************************
const Items = require('../models/items');
const Categories = require('../models/categories');

// ****************************************************
// RETRIEVE CATEGORY BY CATEGORY ID WITH POPULATE
// ****************************************************
const getCategory = function(category_id) {
	return Categories.findById(category_id).populate('items');
};

// ****************************************************
// RETRIEVE ALL CATEGORIES
// ****************************************************
const getCategoryAll = function() {
	return Categories.find({});
};

const run = async function() {
	var categories = await getCategoryAll();
	console.log('\n>> categories:\n', categories);

	//console.log(await getCategory('5e9371a7235c002dacfb22ae'));
};
