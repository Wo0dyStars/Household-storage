// **********************************
// IMPORTS
// **********************************
const mongoose = require('mongoose');

// **********************************
// DECLARATION OF SCHEMA
// **********************************
const BasketSchema = new mongoose.Schema({
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Users'
	},
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
module.exports = mongoose.model('Basket', BasketSchema);
