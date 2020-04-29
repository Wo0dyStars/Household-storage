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
const MongoDBStore = require('connect-mongodb-session')(session);
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
const BasketRoutes = require('./routes/basket');
const PurchasesRoutes = require('./routes/purchases');
const StockRoutes = require('./routes/stock');

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
const store = new MongoDBStore({
	uri: 'mongodb://localhost:27017/test__1',
	collection: 'mySessions'
});

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
		saveUninitialized: true,
		unset: 'destroy',
		cookie: {
			maxAge: 30 * 60 * 1000
		},
		store: store
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
	if (req.user) {
		if (req.session.baskets && req.session.baskets.length) {
			let foundUser = false;
			req.session.baskets.forEach((basket) => {
				if (basket.id.equals(req.user._id)) {
					foundUser = true;
					req.session.basketqty = basket.items.length;
					res.locals.BasketQuantity = basket.items.length;
				}
			});

			if (!foundUser) {
				req.session.basketqty = 0;
				res.locals.BasketQuantity = 0;
			}
		} else {
			req.session.basketqty = 0;
			res.locals.BasketQuantity = 0;
		}
	}
	next();
});

// **********************************
// DEFINE ROUTES
// **********************************
app.use('/', IndexRoutes);
app.use('/items', ItemsRoutes);
app.use('/users', UsersRoutes);
app.use('/shoppings', ShoppingRoutes);
app.use('/basket', BasketRoutes);
app.use('/purchases', PurchasesRoutes);
app.use('/stock', StockRoutes);

// **********************************
// CONNECTING TO THE SERVER AT PORT 3000
// **********************************
app.listen(3000, (err) => {
	console.log('Server is listening to port 3000.');
});
