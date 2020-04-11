// **********************************
// IMPORTS
// **********************************
const mongoose = require('mongoose');

// **********************************
// DECLARATION OF SCHEMA
// **********************************
const ShoppingSchema = new mongoose.Schema({
	item: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Items'
		},
		quantity: String
	}
});

// **********************************
// EXPORTING SCHEMA
// **********************************
module.exports = mongoose.model('Shoppings', ShoppingSchema);

// **********************************
// CREATE AN INSTANCE EXAMPLE
// **********************************
const newShopping = {
	item: {
		// Existing id in Items Schema
		id: '5e9194cee66abe4194299d31',
		quantity: 3
	}
};

// Shoppings.create(newShopping, (err, new_) => {
// 	if (err) console.log(err);
// 	console.log(new_);
// });
