// **********************************
// IMPORTS
// **********************************
const express = require('express');
const router = express.Router();

// **********************************
// GET ROUTE FOR HANDLING LANDING PAGE
// **********************************
router.get('/', (req, res) => {
	res.render('landing');
});

// **********************************
// EXPORTING ROUTER
// **********************************
module.exports = router;
