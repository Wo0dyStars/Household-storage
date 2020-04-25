// **********************************
// IMPORTS
// **********************************
const mongoose = require('mongoose');

// **********************************
// DECLARATION OF SCHEMA
// **********************************
const PurchaseSchema = new mongoose.Schema({
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Users'
	},
	items: [
		{
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Items'
			},
			quantity: Number,
			price: Number
		}
	],
	purchased_at: { type: Date, default: Date.now() }
});

// **********************************
// EXPORTING SCHEMA
// **********************************
module.exports = mongoose.model('Purchase', PurchaseSchema);
