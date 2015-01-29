//	Passport requires for FB login
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

//	Configure FB connect method
var FACEBOOK_APP_ID = '1007034979322153';
var FACEBOOK_APP_SECRET = 'f8478c7f34e451b27e3b1c118437ff8a';

// Twitter App Data
var TWITTER_CONSUMER_KEY = '9RZksOa8esVXKLytGQY3cXScJ';
var TWITTER_CONSUMER_SECRET = 'ksc0TgxpwwP7xzsKAofoMCAiUc5TFGVk8CEFe5mFRSi2CShDqk';

module.exports = function(){
	console.log('passport running');
	app.use(passport.initialize());
	app.use(passport.session());

	passport.use(new FacebookStrategy({
		clientID: FACEBOOK_APP_ID,
		clientSecret: FACEBOOK_APP_SECRET,
		callbackURL: "http://localhost:8000/auth/facebook/callback"
		},
		function(accessToken, refreshToken, profile, done) {
			console.log(profile);
		}
	));

	//	Define FB login route
	app.get('/auth/facebook', passport.authenticate('facebook'));

	//	Define FB callback method
	app.get('/auth/facebook/callback', 
		passport.authenticate('facebook', {failureRedirect: '/' }),
		function(req, res){
			// Successful authentication
			res.redirect('/accounts');
		});


	// Twitter
	passport.use(new TwitterStrategy({
		consumerKey: TWITTER_CONSUMER_KEY,
		consumerSecret: TWITTER_CONSUMER_SECRET,
		callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
	},
	function(token, tokenSecret, profile, done) {
		console.log(profile);
	}));

	//	Define FB login route
	app.get('/auth/twitter', passport.authenticate('twitter'));

	//	Define FB callback method
	app.get('/auth/twitter/callback', 
		passport.authenticate('twitter', { failureRedirect: '/' }),
		function(req, res) {
			// Successful authentication
			res.redirect('/accounts');
		}
	);
}