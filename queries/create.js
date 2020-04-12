// ****************************************************
// SCHEMA IMPORTS
// ****************************************************
const Items = require('../models/items');
const Categories = require('../models/categories');

// ****************************************************
// CREATE A NEW ITEM AND UPDATE CORRESPONDING CATEGORY
// ****************************************************
const createItem = function(category_id, item) {
	return Items.create(item).then((new_item) => {
		console.log('\n>> Created item:\n', new_item);

		return Categories.findByIdAndUpdate(
			category_id,
			{ $push: { items: new_item._id } },
			{ new: true, useFindAndModify: false }
		);
	});
};

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
// RUNNING CODE FOR STORING SAMPLE DATA
// ****************************************************
const run = async function() {
	var category = await createCategory({
		name: 'Vegetables'
	});

	// First item
	category = await createItem(category._id, {
		name: 'Brown onion',
		image: '/images/brown_onion.png',
		quantity: 2,
		reorder_quantity: 1,
		created_at: Date.now()
	});
	console.log('\n>> Category:\n', category);

	// Second item
	category = await createItem(category._id, {
		name: 'Longlife milk',
		image: '/images/longlife_milk.jfif',
		quantity: 3,
		reorder_quantity: 1,
		created_at: Date.now()
	});
	console.log('\n>> Category:\n', category);
};
