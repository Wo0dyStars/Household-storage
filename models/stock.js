// **********************************
// IMPORTS
// **********************************
const mongoose = require('mongoose');

// **********************************
// DECLARATION OF SCHEMA
// **********************************
const StockSchema = new mongoose.Schema({
	team_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Teams'
	},
	items: [
		{
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Items'
			},
			quantity: Number,
			reorder_quantity: Number
		}
	]
});

// **********************************
// EXPORTING SCHEMA
// **********************************
module.exports = mongoose.model('Stock', StockSchema);
