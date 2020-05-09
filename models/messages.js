// **********************************
// IMPORTS
// **********************************
const mongoose = require('mongoose');

// **********************************
// DECLARATION OF SCHEMA
// **********************************
const MessageSchema = new mongoose.Schema({
	username: String,
	email: String,
	message: String,
	sent_at: { type: Date, default: Date.now() }
});

// **********************************
// EXPORTING SCHEMA
// **********************************
module.exports = mongoose.model('Message', MessageSchema);
