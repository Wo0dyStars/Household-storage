// **********************************
// IMPORTS
// **********************************
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

// **********************************
// DECLARATION OF SCHEMA
// **********************************
const UsersSchema = new mongoose.Schema({
	username: String,
	firstname: String,
	middlename: String,
	lastname: String,
	email: String,
	password: String,
	country: String,
	city: String,
	phone: String,
	team_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Teams',
		default: null
	},
	joined_at: { type: Date },
	updated_at: { type: Date, default: Date.now }
});

// **********************************
// EXPORTING SCHEMA
// **********************************
UsersSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('Users', UsersSchema);
