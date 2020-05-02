// **********************************
// IMPORTS
// **********************************
const mongoose = require('mongoose');

// **********************************
// DECLARATION OF SCHEMA
// **********************************
const TeamsSchema = new mongoose.Schema({
	name: String,
	users: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Users'
		}
	],
	requests: [
		{
			user_id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Users'
			},
			acceptedBy: [
				{
					user_id: {
						type: mongoose.Schema.Types.ObjectId,
						ref: 'Users'
					},
					accepted: { type: Boolean, default: false }
				}
			]
		}
	],
	created_at: { type: Date },
	updated_at: { type: Date, default: Date.now }
});

// **********************************
// EXPORTING SCHEMA
// **********************************
module.exports = mongoose.model('Teams', TeamsSchema);
