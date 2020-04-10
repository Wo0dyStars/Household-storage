var express = require('express');
var app = express();
var mongoose = require('mongoose');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose
	.connect('mongodb://localhost:27017/test__1', {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true
	})
	.then(console.log('DB Connection Successfull'))
	.catch((err) => {
		console.error(err);
	});

app.get('/', (req, res) => {
	res.send('home');
});

app.listen(3000, (err) => {
	console.log('Server is listening to port 3000.');
});
