// **********************************
// IMPORTS
// **********************************
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const Items = require('./queries/items');
const Categories = require('./queries/categories');
const Users = require('./queries/users');
const Teams = require('./queries/teams');

const User = require('./models/users');

// **********************************
// ROUTE IMPORTS
// **********************************
const ItemsRoutes = require('./routes/items');
const UsersRoutes = require('./routes/users');
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

const middlewares = [
	express.static(__dirname + '/public'),
	bodyParser.urlencoded({ extended: true }),
	methodOverride('_method'),
	cookieParser(),
	session({
		secret: 'super-secret-key',
		resave: false,
		saveUninitialized: false
	}),
	flash(),
	passport.initialize(),
	passport.session()
];

app.use(middlewares);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	// res.locals.error = req.flash('error');
	// res.locals.success = req.flash('success');
	next();
});

// **********************************
// DEFINE ROUTES
// **********************************
app.use('/', IndexRoutes);
app.use('/items', ItemsRoutes);
app.use('/users', UsersRoutes);
app.use('/shoppings', ShoppingRoutes);

// **********************************
// CONNECTING TO THE SERVER AT PORT 3000
// **********************************
app.listen(3000, (err) => {
	console.log('Server is listening to port 3000.');
});
