// **********************************
// IMPORTS
// **********************************
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// **********************************
// ROUTE IMPORTS
// **********************************
const ItemsRoutes = require('./routes/items');
const ShoppingRoutes = require('./routes/shoppings');
const IndexRoutes = require('./routes/index');

// **********************************
// HANDLE MONGOOSE DEPRECATION
// **********************************
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// **********************************
// MONGOOSE CONNECTION
// **********************************
const URL = 'mongodb://localhost:27017/test__1';
mongoose
	.connect(URL)
	.then(() => console.log('Successful connection to the Mongo server'))
	.catch((err) => console.log('Error caught', err.stack));

// **********************************
// APP CONFIGURATIONS
// **********************************
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// **********************************
// DEFINE ROUTES
// **********************************
app.use('/', IndexRoutes);
app.use('/items', ItemsRoutes);
app.use('/shoppings', ShoppingRoutes);

// **********************************
// CONNECTING TO THE SERVER AT PORT 3000
// **********************************
app.listen(3000, (err) => {
	console.log('Server is listening to port 3000.');
});
