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
		console.log('\n>> Category ID:\n', category_id);

		return Categories.findByIdAndUpdate(
			category_id,
			{ $push: { items: new_item._id } },
			{ new: true, useFindAndModify: false }
		).then((new_category, err) => {
			if (err) {
				console.log(err);
			} else {
				console.log('Added item ID ', new_item._id, ' to category ', new_category);

				return Items.findByIdAndUpdate(new_item._id, {
					category_id: new_category._id
				}).then((updated_item, err) => {
					if (err) {
						console.log(err);
					} else {
						console.log('Item ID ', new_item._id, ' has been updated to ', updated_item);
					}
				});
			}
		});
	});
};

// ****************************************************
// PRINT ITEM BY ITEM ID
// ****************************************************
const printItemByID = function(item_id) {
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
// PRINT ALL ITEMS
// ****************************************************
const printItems = function() {
	return Items.find({}, (err, items) => {
		if (err) console.log(err);
		console.log('\n>> Items:\n', items);
	});
};

const getItemsWithPopulate = function() {
	return Items.find({}).populate('category_id').exec((err, items) => {
		if (err) {
			return console.log(err);
		} else {
			return items;
		}
	});
};

// ****************************************************
// DELETE ALL ITEMS AND CORRESPONDING IDS FROM CATEGORY
// ****************************************************
const DeleteItems = async function() {
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

const run = async function() {
	// SampleItems.forEach(async (SampleItem) => {
	// 	let CategoryID = await FindCategoryIDByName(SampleItem.Category);
	// 	await createItem(CategoryID, SampleItem.Item);
	// });
	// await DeleteItems();
	// await DeleteItemByID('5e9ad4b14f800933e40acbea');
	await printItems();
};

// ****************************************************
// RUN THIS STATEMENT ONLY WITH CARE
// ****************************************************
// run();

// ****************************************************
// EXPORTING ITEM QUERIES
// ****************************************************
module.exports = {
	createItem,
	printItemByID,
	printItems,
	DeleteItems,
	DeleteItemByID,
	FindCategoryIDByName,
	getItemsWithPopulate
};
