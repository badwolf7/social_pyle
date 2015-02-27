var Cookies = require('cookies');
//  OAuth
var OAuth = require('oauth').OAuth
//	Passport
var passport = require('passport');
//  Passport Facebook
var FacebookStrategy = require('passport-facebook').Strategy;
//  Passport Google
var GoogleStrategy = require('passport-google-oauth2');
var GoogleTokenStrategy = require('passport-google-token').Strategy;
var google = require('googleapis');
var plus = google.plus('v1');

//	Configure FB connect method
var FACEBOOK_APP_ID = '1007034979322153';
var FACEBOOK_APP_SECRET = 'f8478c7f34e451b27e3b1c118437ff8a';
var fb_accessToken = '';
var fb_refreshToken = '';
var fb_profile = '';

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

// LinkedIn App Data
var LINKEDIN_API_KEY = '78sio16pazf34t';
var LINKEDIN_SECRET_KEY = 'MkKLY7FZJr9lhzvU';
var LINKEDIN_OAUTH_TOKEN = 'ff8bd1f0-bd0f-4e91-9bf6-d701cdf0314d';
var LINKEDIN_OAUTH_SECRET = 'a8bef072-65a1-4854-86de-97b75073a164';
var LINKEDIN_CALLBACK_URL = 'http://127.0.0.1:3000/auth/linkedin/callback';

var Linkedin = require('node-linkedin')(LINKEDIN_API_KEY,LINKEDIN_SECRET_KEY,LINKEDIN_CALLBACK_URL)

// MySQL Connection
var mysql = require('mysql');
var connection = mysql.createConnection({
	host: '127.0.0.1',
	port: '8889',
	user: 'root',
	password: 'root',
	database: 'socialPyle'
});
connection.connect();

var sesCookies = {};
var cookies;

module.exports = function(){
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
			console.log('|||||| Facebook Profile ||||||');
			console.log(profile);

			fb_accessToken = accessToken;
			fb_refreshToken = refreshToken;
			fb_profile = profile;

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
								'userId': localUser.id,
								'token': accessToken,
								'refreshToken': refreshToken
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
			cookies = new Cookies(req, res);
			cookies.set('fb_token',fb_accessToken,{'maxAge': '31556952000'});

			if(req.session.accounts == undefined || req.session.accounts == null){
				req.session.accounts = {};
			}
			req.session.accounts.facebook = {};
			req.session.user = req.user;
			if(req.session.direction){
				res.redirect(req.session.direction);
				delete req.session.direction;
			}else{
				req.session.accounts.facebook.oauth = {
					'accessToken': fb_accessToken,
					'refreshToken': fb_refreshToken
				}
				req.session.accounts.facebook.profile = fb_profile;
				res.redirect('/facebook/info');
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
		cookies = new Cookies(req, res);
		sesCookies.TwitterToken = cookies.get('twitter_token');

		if(req.session.accounts == undefined || req.session.accounts == null){
			req.session.accounts = {};
		}
		req.session.accounts.twitter = {};
		req.session.accounts.twitter.oauth = {};

		if(sesCookies.TwitterToken == undefined){
			console.log('|||||||||||||||----------------------------------------------------------------*************************  NO Twitter Token');
			
			oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
				if (error) {
					console.log(error);
					res.send("Authentication Failed!");
				}else {
					req.session.accounts.twitter.oauth = {
						token: oauth_token,
						token_secret: oauth_token_secret
					};
					
					res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token);
				}
			});
		}else{
			console.log('|||||||||||||||----------------------------------------------------------------*************************  Twitter Token Auth');

			res.redirect('/auth/twitter/callback');
		}
	});
	app.get('/auth/twitter/callback', function(req, res, next){
		cookies = new Cookies(req, res);

		var oauth_data = {}
		req.session.user = {};
		req.session.accounts.twitter.oauth = req.query;
		req.session.accounts.twitter.oauth.verifier = req.query.oauth_verifier;
		if(sesCookies.TwitterToken == undefined){
			if (req.session.accounts.twitter.oauth) {
				oauth_data = req.session.accounts.twitter.oauth;
				
				oauth.getOAuthAccessToken(oauth_data.oauth_token, req.session.accounts.twitter.oauth.token_secret, oauth_data.verifier,
					function(error, oauth_access_token, oauth_access_token_secret, results) {
						if (error) {
							console.log(error);
							res.send("Authentication Failure!");
						}
						else {
							req.session.accounts.twitter.oauth.access_token = oauth_access_token;
							req.session.accounts.twitter.oauth.access_token_secret = oauth_access_token_secret;
							req.session.accounts.twitter.user_id = results.user_id;
							req.session.accounts.twitter.screen_name = results.screen_name;

							cookies.set('twitter_token',oauth_access_token,{'maxAge': '31556952000'});

							console.log("||||||||||  Auth YAY  ||||||||||||");
							console.log('Twitter Results');
							console.log(results);
							console.log('');
							console.log('');

							res.redirect('/twitter/users/lookup');
						}
					}
				);
			}else {
				res.redirect('/'); // Redirect to login page
			}
		}else{
			console.log('|||||||||||||||----------------------------------------------------------------*************************  Twitter Token Callback');
			// MySQL Queries
			var twitterQuery = 'SELECT * FROM twitters WHERE token = "' + sesCookies.TwitterToken + '";';
			sesCookies.twtTokenSecret = '';

			var twtRedirect = function(){
				console.log(req.session.accounts.twitter);
				res.redirect('/twitter/users/lookup');
			}

			connection.query(twitterQuery, function(err, rows, fields){
				if(err){
					console.log(twitterQuery);
					console.log('');
					console.log('');
					console.log(err);
				}
				for(var i in rows){
					console.log('|||||||||||||||----------------------------------------------------------------************************* Twitter MySQL');
					console.log(rows[i]);

					sesCookies.twtTokenSecret = req.session.accounts.twitter.oauth.access_token_secret = rows[i].tokenSecret;
					req.session.accounts.twitter.oauth.access_token = sesCookies.TwitterToken;
					req.session.accounts.twitter.user_id = rows[i].id;
					req.session.accounts.twitter.screen_name = rows[i].displayName;

				}
				twtRedirect();
			});
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

		googleAccessToken = accessToken;
		googleRefreshToken = refreshToken;

		console.log(googleAccessToken);
		console.log(googleRefreshToken);
		console.log('||||||||||||  Google Profile  ||||||||||||');
		console.log(profile);

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
							'profileImageUrl': gUser.profileImageUrl,
							'token': googleAccessToken,
							'refreshToken': googleRefreshToken
						} 
					})
					.success(function(user, created) {
						done(null,localUser);
					});
			});
	}));

	// Google Plus
	// Define Google Plus login route
	app.get('/auth/google/passport',passport.authenticate('google', {
				scope: [ 
					'https://www.googleapis.com/auth/plus.login',
					'https://www.googleapis.com/auth/plus.profile.emails.read',
					'https://www.googleapis.com/auth/plus.me'
				]
			}));
	app.get('/auth/google', function(req,res){
		cookies = new Cookies(req, res);
		sesCookies.GoogleToken = cookies.get('google_token');

		if(req.session.accounts == undefined || req.session.accounts == null){
			req.session.accounts = {};
		}
		if(req.session.user == undefined){
			req.session.user = {};
		}
		req.session.accounts.google = {};
		req.session.accounts.google.oauth = {};
		req.session.accounts.google.oauth.accessToken = '';
		req.session.accounts.google.oauth.refreshToken = '';

		if(sesCookies.GoogleToken == undefined){
			console.log('new googler');
			res.redirect('/auth/google/passport')
		}else{
			console.log(sesCookies.GoogleToken);
			req.session.accounts.google.oauth.accessToken = sesCookies.GoogleToken;

			var googleQuery = 'SELECT * FROM googles WHERE token = "' + sesCookies.GoogleToken + '";';
			sesCookies.googleRefreshToken = '';

			var googleRedirect = function(){
				console.log(req.session.accounts.google);
				res.redirect('/google/people/get');
			}

			var getUser = function(){
				var userQuery = 'SELECT * FROM users WHERE id = "' + req.session.user.id + '";';

				connection.query(userQuery, function(err, rows, fields){
					console.log('user query');
					if(err){
						console.log(userQuery);
						console.log('');
						console.log('');
						console.log(err);
					}
					for(var i in rows){
						console.log('|||||||||||||||----------------------------------------------------------------************************* User MySQL');
						console.log(rows[i]);

						req.session.user = rows[i];
					}
					googleRedirect();
				});
			}

			connection.query(googleQuery, function(err, rows, fields){
				console.log('google query');
				if(err){
					console.log(googleQuery);
					console.log('');
					console.log('');
					console.log(err);
				}
				for(var i in rows){
					console.log('|||||||||||||||----------------------------------------------------------------************************* Google MySQL');
					console.log(rows[i]);

					sesCookies.googleRefreshToken = req.session.accounts.google.oauth.refreshToken = rows[i].refreshToken;
					req.session.accounts.google.user_id = rows[i].id;
					req.session.user.id = rows[i].userId;
				}
				getUser();
			});
		}
	});

	app.get( '/auth/google/callback', passport.authenticate('google', {failureRedirect: '/' }),
		function(req, res){
			cookies = new Cookies(req, res);
			cookies.set('google_token',googleAccessToken,{'maxAge': '31556952000'});

			req.session.user = req.user;

			req.session.accounts.google.oauth.accessToken = googleAccessToken;
			req.session.accounts.google.oauth.refreshToken = googleRefreshToken;

			res.redirect('/google/people/get');
		}
	);
}