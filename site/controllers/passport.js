//	Passport
var passport = require('passport');
//  Passport Facebook
var FacebookStrategy = require('passport-facebook').Strategy;
//  Passport Twitter
var Twitter = require('twitter');
//  Passport Google
var GooglePlusStrategy = require('passport-google-oauth').OAuthStrategy;

//	Configure FB connect method
var FACEBOOK_APP_ID = '1007034979322153';
var FACEBOOK_APP_SECRET = 'f8478c7f34e451b27e3b1c118437ff8a';

// Twitter App Data
var TWITTER_CONSUMER_KEY = '9RZksOa8esVXKLytGQY3cXScJ';
var TWITTER_CONSUMER_SECRET = 'ksc0TgxpwwP7xzsKAofoMCAiUc5TFGVk8CEFe5mFRSi2CShDqk';
var TWITTER_ACCESS_TOKEN = '2863998855-tt2FzUqp4Xr0JHCNYfAM9siWAH8Y5dmSFZz8nk9';
var TWITTER_ACCESS_TOKEN_SECRET = 'lJn5CeuGWDdDJzmXkQgzpv7dgEfLwF0qtiUchhuAnHNJK';
var TWITTER_OWNER_ID = '2863998855';

// Google App Data
var GOOGLE_CLIENT_ID = '1044666733227-4u3rtup7s601l651q0ntti5itnpfr1h0.apps.googleusercontent.com';
var GOOGLE_CLIENT_EMAIL = '1044666733227-4u3rtup7s601l651q0ntti5itnpfr1h0@developer.gserviceaccount.com';
var GOOGLE_CLIENT_SECRET = 'FEMCRgUb8rlz76wg-jpYlRZp';

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
			console.log('|||||| profile ||||||');
			console.log(profile);
			fbProfile = profile;
			app.models.User
				.findOrCreate({
					'where': {'fbId': profile.id},
					'defaults':{ 
						'fullName': profile._json.name,
						'email': profile._json.email,
						'active': 1
					} 
				})
				.success(function(localUser, created) {
					app.models.Facebook
						.findOrCreate({
							'where': { 'userId': localUser.id },
							'defaults':{
								'id': profile.id,
								'displayName': profile.displayName,
								'fullName': localUser.fullName,
								'gender': profile.gender,
								'profileUrl': profile.profileUrl,
								'locale': profile._json.locale,
								'timezone': profile._json.timezone,
								'email': profile._json.email,
								'userId': localUser.id
							} 
						})
						.success(function(user, created) {
							done(null,localUser);
						});
				});
		}
	));
	
	//  Twitter
	var client = new Twitter({
		consumer_key: TWITTER_CONSUMER_KEY,
		consumer_secret: TWITTER_CONSUMER_SECRET,
		access_token_key: TWITTER_ACCESS_TOKEN,
		access_token_secret: TWITTER_ACCESS_TOKEN_SECRET
	});

	app.get('/auth/twitter', function(req,res){
		var screenName = req.query.sn;
		var params = {screen_name: screenName};
		client.get('statuses/user_timeline', params, function(error, tweets, response){
			if (!error) {
				console.log(tweets);
			}
		});
	});

	//  Google
	passport.use(new GooglePlusStrategy({
		consumerKey: 'GOOGLE_CLIENT_ID',
		consumerSecret: 'GOOGLE_CLIENT_SECRET',
		callbackURL: "http://127.0.0.1:3000/auth/google/callback"
	},
	function(tokens, profile, done) {
		// Create or update user, call done() when complete... 
		console.log(profile);
	}));



	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});
	passport.deserializeUser(function(id, done) {
		done(null, id);
	});
	


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
			scope: [
				'email',
				// 'user_actions.fitness',
				// 'user_friends',
				'user_birthday',
				// 'user_education_history',
				// 'user_hometown',
				// 'user_interests',
				// 'user_location',
				'user_photos'
				// 'user_relationships',
				// 'user_relationship_details',
				// 'user_religion_politics',
				// 'user_status',
				// 'user_website',
				// 'user_work_history'
			]
		})
	);

	//	Define FB callback method
	app.get('/auth/facebook/callback', passport.authenticate('facebook', {failureRedirect: '/' }),
		function(req, res){
			req.session.user = req.user;
			if(req.session.direction){
				res.redirect(req.session.direction);
				delete req.session.direction;
			}else{
				res.redirect('/dash');
			}
		}
	);


	// Google Plus
	// Define Google Plus login route
	app.get('/auth/google', passport.authenticate('google'));

	// Define Google Plus callback method
	app.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/'}),
		function(req,res){
			console.log('Successful Google Plus Auth');
		}
	);
}