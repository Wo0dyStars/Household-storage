const middleware = {};

middleware.isLoggedIn = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash('error', 'You must be logged in to do that.');
	res.redirect('back');
};

middleware.isNotLoggedIn = function(req, res, next) {
	if (!req.isAuthenticated()) {
		return next();
	}
	req.flash('error', 'You are already logged in.');
	res.redirect('back');
};

module.exports = middleware;
