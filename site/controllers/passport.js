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

	passport.use(new TwitterStrategy({
		consumerKey: TWITTER_CONSUMER_KEY,
		consumerSecret: TWITTER_CONSUMER_SECRET,
		callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
	},
	function(token, tokenSecret, profile, done) {
		console.log(profile);
		res.render('/dash',{twit:profile});
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
	app.get('/auth/facebook/callback', passport.authenticate('facebook', {failureRedirect: '/' }), function(req, res){
		req.session.user = req.user;
		if(req.session.direction){
			res.redirect(req.session.direction);
			delete req.session.direction;
		}else{
			res.redirect('/dash');
		}
	});


	// Twitter
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


	app.get('/logout', function(req, res){
		req.logout();
		req.session.user.destroy();
		console.log('logout');
		res.redirect('/');
	});
}