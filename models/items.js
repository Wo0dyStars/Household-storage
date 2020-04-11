// **********************************
// IMPORTS
// **********************************
const mongoose = require('mongoose');

// **********************************
// DECLARATION OF SCHEMA
// **********************************
const ItemsSchema = new mongoose.Schema({
	name: String,
	image: String,
	quantity: Number,
	reorder_quantity: Number
});

// **********************************
// EXPORTING SCHEMA
// **********************************
module.exports = mongoose.model('Items', ItemsSchema);

// **********************************
// CREATE AN INSTANCE EXAMPLE
// **********************************
const newItem = {
	name: 'Onion',
	image: 'image source',
	quantity: 5,
	reorder_quantity: 2
};

// Items.create(newItem, (err, Item_) => {
// 	if (err) console.log(err);
// 	console.log(Item_);
// });
