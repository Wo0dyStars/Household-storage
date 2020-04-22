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
	store: String,
	quantity: Number,
	reorder_quantity: Number,
	category_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Categories',
		default: null
	},
	created_at: { type: Date },
	updated_at: { type: Date, default: Date.now }
});

// **********************************
// EXPORTING SCHEMA
// **********************************
module.exports = mongoose.model('Items', ItemsSchema);
