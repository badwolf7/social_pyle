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

	var fbProfile = {};

	passport.use(new FacebookStrategy({
		clientID: FACEBOOK_APP_ID,
		clientSecret: FACEBOOK_APP_SECRET,
		callbackURL: "http://localhost:3000/auth/facebook/callback"
		},
		function(accessToken, refreshToken, profile, done) {
			// profileFields: [
			// 	'id',
			// 	'name',
			// 	'photos',
			// 	'picture.type(large)',
			// 	'emails',
			// 	'displayName',
			// 	'about',
			// 	'gender',
			// 	"locale",
			// 	"timezone"
			// ]
			console.log(profile);
			fbProfile = profile;
		}
	));

	//	Define FB login route
	app.get('/auth/facebook',
		passport.authenticate('facebook',{
			profileFields: [
				'id',
				'name',
				'displayName',
				'username',
				'photos',
				'hometown',
				'profileUrl',
				'friends'
			],
			// scope: ['email', 'user_birthday', 'user_likes']
			scope: 
				// 'email',
				// 'user_actions.fitness',
				// 'user_friends',
				'user_birthday'
				// 'user_education_history',
				// 'user_hometown',
				// 'user_interests',
				// 'user_location',
				// 'user_photos',
				// 'user_relationships',
				// 'user_relationship_details',
				// 'user_religion_politics',
				// 'user_status',
				// 'user_website',
				// 'user_work_history'
			
		})
	);

	//	Define FB callback method
	app.get('/auth/facebook/callback', passport.authenticate('facebook', {failureRedirect: '/' }), function(req, res){
		req.session.user = req.user;
		if(req.session.direction){
			res.redirect(req.session.direction);
			delete req.session.direction;
		}else{
			res.json(req.session.user);
		}
	});


	// Twitter
	passport.use(new TwitterStrategy({
		consumerKey: TWITTER_CONSUMER_KEY,
		consumerSecret: TWITTER_CONSUMER_SECRET,
		callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
	},
	function(token, tokenSecret, profile, done) {
		console.log(profile);
		res.render('/dash',{twit:profile});
	}));

	//	Define Twitter login route
	app.get('/auth/twitter', passport.authenticate('twitter'));

	//	Define Twitter callback method
	app.get('/auth/twitter/callback', 
		passport.authenticate('twitter', { failureRedirect: '/' }),
		function(req, res) {
			// Successful authentication
			console.log('Successful twitter authentication');
		}
	);

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});
	passport.deserializeUser(function(id, done) {
		done(null, id);
	});
}