// **********************************
// IMPORTS
// **********************************
const mongoose = require('mongoose');

// **********************************
// DECLARATION OF SCHEMA
// **********************************
const CategoriesSchema = new mongoose.Schema({
	name: String,
	items: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Items'
		}
	]
});

// **********************************
// EXPORTING SCHEMA
// **********************************
module.exports = mongoose.model('Categories', CategoriesSchema);
