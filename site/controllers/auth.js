//  OAuth
var OAuth = require('oauth').OAuth
//	Passport
var passport = require('passport');
//  Passport Facebook
var FacebookStrategy = require('passport-facebook').Strategy;
//  Passport Google
var GoogleStrategy = require('passport-google-oauth2');

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

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});
	passport.deserializeUser(function(id, done) {
		done(null, id);
	});

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

	
	//  Twitter
	oauth = new OAuth(
		"https://api.twitter.com/oauth/request_token",
		"https://api.twitter.com/oauth/access_token",
		TWITTER_CONSUMER_KEY,
		TWITTER_CONSUMER_SECRET,
		"1.0",
		"http://127.0.0.1:3000/auth/twitter/callback",
		"HMAC-SHA1"
	);
	app.get('/auth/twitter', function(req, res) {
		oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
			if (error) {
				console.log(error);
				res.send("Authentication Failed!");
			}else {
				req.session.oauth = {
					token: oauth_token,
					token_secret: oauth_token_secret
				};
				res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token);
				console.log('redirect');
			}
		});
	});
	app.get('/auth/twitter/callback', function(req, res, next){
		console.log('welcome back');
		req.session.oauth = req.query;
		req.session.twitter = {};
		req.session.user = {};
		req.session.oauth.verifier = req.query.oauth_verifier;
		var oauth_data = {}
		if (req.session.oauth) {
			console.log('callback');
			oauth_data = req.session.oauth;
			
			oauth.getOAuthAccessToken(oauth_data.oauth_token, req.session.oauth.token_secret, oauth_data.verifier,
				function(error, oauth_access_token, oauth_access_token_secret, results) {
					if (error) {
						console.log(error);
						res.send("Authentication Failure!");
					}
					else {
						req.session.oauth.access_token = oauth_access_token;
						req.session.oauth.access_token_secret = oauth_access_token_secret;
						req.session.twitter.user_id = results.user_id;
						req.session.twitter.screen_name = results.screen_name;

						console.log("||||||||||  Auth YAY  ||||||||||||");

						oauth.get(
							'https://api.twitter.com/1.1/statuses/user_timeline.json?user_id='+req.session.twitter.user_id,
							req.session.oauth.access_token,
							req.session.oauth.access_token_secret,
							function (e, profile, obj){
								if (e) console.error(e);

								profile = JSON.parse(profile);

								twtProfile = {
									"id": profile[0].user.id,
									"fullName": profile[0].user.name,
									"displayName": profile[0].user.screen_name,
									"location": profile[0].user.location,
									"locale": profile[0].user.lang,
									"timezone": profile[0].user.time_zone,
									"followersCount": profile[0].user.followers_count,
									"friendsCount": profile[0].user.friends_count,
									"listedCount": profile[0].user.listed_count,
									"favouritesCount": profile[0].user.favourites_count,
									"statusesCount": profile[0].user.statuses_count,
									"profileImageUrl": profile[0].user.profile_image_url,
									"profileImageUrlHttps": profile[0].user.profile_image_url_https
								}
								req.session.user = twtProfile;

								app.models.User
									.findOrCreate({
										'where': {'twtId': twtProfile.id},
										'defaults':{ 
											'fullName': twtProfile.fullName,
											'active': 1
										} 
									})
									.success(function(localUser, created) {
										app.models.Twitter
											.findOrCreate({
												'where': { 'userId': localUser.id },
												'defaults':{
													"id": twtProfile.id,
													"fullName": twtProfile.fullName,
													"displayName": twtProfile.displayName,
													"location": twtProfile.location,
													"locale": twtProfile.locale,
													"timezone": twtProfile.timezone,
													"followersCount": twtProfile.followersCount,
													"friendsCount": twtProfile.friendsCount,
													"listedCount": twtProfile.listedCount,
													"favouritesCount": twtProfile.favouritesCount,
													"statusesCount": twtProfile.statusesCount,
													"profileImageUrl": twtProfile.profileImageUrl,
													"profileImageUrlHttps": twtProfile.profileImageUrlHttps
												}
											})
											.success(function(user, created) {
												console.log("");
												console.log("");
												console.log("req.session.user before:");
												console.log(req.session.user);
												res.redirect('/dash');
											});
									});
							}
						);
					}
				}
			);
		}else {
			res.redirect('/'); // Redirect to login page
		}
	});


	//  Google
	passport.use(new GoogleStrategy({
		clientID: GOOGLE_CLIENT_ID,
		clientSecret: GOOGLE_CLIENT_SECRET,
		callbackURL: "http://127.0.0.1:3000/auth/google/callback",
		passReqToCallback   : true
	},
	function(request, accessToken, refreshToken, profile, done){
		var profileImg = profile.photos[0].value;
		profileImg = profileImg.substring(0, profileImg.indexOf('?'));

		var gUser = {
			'id': profile.id,
			'displayName': profile.displayName,
			'fullName': profile.name.givenName+" "+profile.name.familyName,
			'location': profile.placesLived[0].value,
			'locale': profile.language,
			'email': profile.emails[0].value,
			'gender': profile.gender,
			'profileUrl': profile._json.url,
			'profileImageUrl': profileImg
		}
		app.models.User
			.findOrCreate({
				'where': {'gId': gUser.id},
				'defaults':{ 
					'fullName': gUser.fullName,
					'email': gUser.email,
					'active': 1
				} 
			})
			.success(function(localUser, created) {
				app.models.Google
					.findOrCreate({
						'where': { 'userId': localUser.id },
						'defaults':{
							'id': gUser.id,
							'displayName': gUser.displayName,
							'fullName': gUser.fullName,
							'location': gUser.location,
							'locale': gUser.locale,
							'email': gUser.email,
							'gender': gUser.gender,
							'profileUrl': gUser.profileUrl,
							'profileImageUrl': gUser.profileImageUrl
						} 
					})
					.success(function(user, created) {
						done(null,localUser);
					});
			});
	}));


	// Google Plus
	// Define Google Plus login route
	app.get('/auth/google', passport.authenticate('google', {
		scope: [ 
			'https://www.googleapis.com/auth/plus.login',
			'https://www.googleapis.com/auth/plus.profile.emails.read'
		]
	}));

	app.get( '/auth/google/callback', passport.authenticate('google', {failureRedirect: '/' }),
		function(req, res){
			req.session.user = req.user;

			if(req.session.direction){
				res.redirect(req.session.direction);
				delete req.session.direction;
			}else{
				console.log("");
				console.log("");
				console.log("req.session.user before:");
				console.log(req.session.user);
				res.redirect('/dash');
			}
		}
	);
}