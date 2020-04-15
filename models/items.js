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
	reorder_quantity: Number,
	category_name: String,
	created_at: { type: Date },
	updated_at: { type: Date, default: Date.now }
});

// **********************************
// EXPORTING SCHEMA
// **********************************
module.exports = mongoose.model('Items', ItemsSchema);
