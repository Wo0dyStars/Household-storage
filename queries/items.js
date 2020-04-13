// ****************************************************
// SCHEMA IMPORTS
// ****************************************************
const Items = require('../models/items');
const Categories = require('../models/categories');

// ****************************************************
// RETRIEVE ITEM BY ITEM ID
// ****************************************************
const getItemByID = function(item_id) {
	return Items.findById(item_id, (err, item) => {
		if (err) console.log(err);
		if (item) {
			console.log('\n>> Item:\n', item);
		} else {
			console.log(`Item with ${item_id} is not present in Items.`);
		}
	});
};

// ****************************************************
// RETRIEVE ALL ITEMS
// ****************************************************
const getItemAll = function() {
	return Items.find({}, (err, items) => {
		if (err) console.log(err);
		console.log('\n>> Items:\n', items);
	});
};

// ****************************************************
// DELETE ALL ITEMS AND CORRESPONDING IDS FROM CATEGORY
// ****************************************************
const DeleteItemAll = async function() {
	await Items.find({}, (err, items) => {
		items.forEach((item) => {
			DeleteItemByID(item._id);
		});
	});
};

// ****************************************************
// DELETE ITEM BY ITEM ID AND CORRESPONDING ID FROM CATEGORY
// ****************************************************
const DeleteItemByID = function(ItemID) {
	return Items.deleteOne({ _id: ItemID }, (err) => {
		if (err) console.log(err);
		console.log('\n>> Item deleted.\n');

		// Delete Item ID from corresponding Category as well
		Categories.updateOne({ items: ItemID }, { $pull: { items: ItemID } }, (err) => {
			if (err) console.log(err);
		});
	});
};

const run = async function() {
	// var DeletedItemsAll = await DeleteItemAll();
	//var DeletedItem = await DeleteItemByID('5e9476b65369324198bdbe68');
	//var itemID = await getItemByID('5e9464116f7ba9202445e2e1');
	var items = await getItemAll();
};

// ****************************************************
// RUN THIS STATEMENT ONLY WITH CARE
// ****************************************************
// run();
