// **********************************
// IMPORTS
// **********************************
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// **********************************
// SCHEMA IMPORTS
// **********************************
const Items = require('./models/items');
const Shoppings = require('./models/shoppings');

mongoose
	.connect('mongodb://localhost:27017/test__1', {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true
	})
	.then(console.log('DB Connection Successful'))
	.catch((err) => {
		console.error(err);
	});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

Shoppings.find({}, (err, found) => {
	if (err) console.log(err);
	console.log(found[0].item.id);

	Items.findById(found[0].item.id, (err, found_) => {
		if (err) console.log(err);
		console.log(found_);
	});
});

app.get('/', (req, res) => {
	res.send('home');
});

app.get('/items/new', (req, res) => {
	res.render('items/new');
});

app.post('/items/new', (req, res) => {
	const { name, image, quantity, reorder_quantity } = req.body.items;
	const newItems = { name, image, quantity, reorder_quantity };

	Items.create(newItems, (err, newItem) => {
		if (err) console.log(err);
		console.log(newItem);
		res.redirect('/');
	});
});

app.listen(3000, (err) => {
	console.log('Server is listening to port 3000.');
});
