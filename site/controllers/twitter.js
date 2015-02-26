//  OAuth
var OAuth = require('oauth').OAuth

// Twitter App Data
var TWITTER_CONSUMER_KEY = '9RZksOa8esVXKLytGQY3cXScJ';
var TWITTER_CONSUMER_SECRET = 'ksc0TgxpwwP7xzsKAofoMCAiUc5TFGVk8CEFe5mFRSi2CShDqk';
var TWITTER_ACCESS_TOKEN = '2863998855-tt2FzUqp4Xr0JHCNYfAM9siWAH8Y5dmSFZz8nk9';
var TWITTER_ACCESS_TOKEN_SECRET = 'lJn5CeuGWDdDJzmXkQgzpv7dgEfLwF0qtiUchhuAnHNJK';
var TWITTER_OWNER_ID = '2863998855';

module.exports = function(){
	app.get('/twitter/users/lookup', function(req,res,next){
		oauth.get(
			'https://api.twitter.com/1.1/users/lookup.json?user_id='+req.session.accounts.twitter.user_id,
			req.session.accounts.twitter.oauth.access_token,
			req.session.accounts.twitter.oauth.access_token_secret,
			function (e, profile, obj){
				if (e) console.error(e);

				profile = JSON.parse(profile);

				console.log(req.session.accounts.twitter.oauth.access_token);
				console.log(req.session.accounts.twitter.oauth.access_token_secret);
				console.log('||||||||||||  Twitter Profile  ||||||||||||');
				console.log(profile);
				console.log('');
				console.log('');

				twtProfile = {
					"id": profile[0].id,
					"fullName": profile[0].name,
					"displayName": profile[0].screen_name,
					"location": profile[0].location,
					"locale": profile[0].lang,
					"timezone": profile[0].time_zone,
					"followersCount": profile[0].followers_count,
					"friendsCount": profile[0].friends_count,
					"listedCount": profile[0].listed_count,
					"favouritesCount": profile[0].favourites_count,
					"statusesCount": profile[0].statuses_count,
					"profileImageUrl": profile[0].profile_image_url,
					"profileImageUrlHttps": profile[0].profile_image_url_https
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
						req.session.user.fbId = localUser.dataValues.fbId;
						req.session.user.twtId = localUser.dataValues.twtId;
						req.session.user.gId = localUser.dataValues.gId;
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
									"profileImageUrlHttps": twtProfile.profileImageUrlHttps,
									"token": req.session.accounts.twitter.oauth.access_token,
									"tokenSecret": req.session.accounts.twitter.oauth.access_token_secret
								}
							})
							.success(function(user, created) {
								res.redirect('/twitter/statuses/user_timeline');
							});
					});
			}
		);
	});


	app.get('/twitter/statuses/user_timeline', function(req,res,next){
		oauth.get(
			'https://api.twitter.com/1.1/statuses/user_timeline.json?user_id='+req.session.accounts.twitter.user_id,
			req.session.accounts.twitter.oauth.access_token,
			req.session.accounts.twitter.oauth.access_token_secret,
			function (e, tweets, obj){
				if (e) console.error(e);

				tweets = JSON.parse(tweets);
				req.session.accounts.twitter.tweets = tweets;
				console.log('||||||||||||  Twitter Tweets  ||||||||||||');
				console.log(tweets);
				console.log('');
				console.log('');
				// res.json(tweets);
				res.redirect('/twitter/statuses/home_timeline');
			}
		);
	});

	app.get('/twitter/statuses/home_timeline', function(req,res,next){
		oauth.get(
			'https://api.twitter.com/1.1/statuses/home_timeline.json?user_id='+req.session.accounts.twitter.user_id,
			req.session.accounts.twitter.oauth.access_token,
			req.session.accounts.twitter.oauth.access_token_secret,
			function (e, timeline, obj){
				if (e) console.error(e);

				timeline = JSON.parse(timeline);
				req.session.accounts.twitter.timeline = timeline;
				console.log('||||||||||||  Twitter Timeline  ||||||||||||');
				console.log(timeline);
				console.log('');
				console.log('');
				// res.json(timeline);
				res.redirect('/dash');
			}
		);
	});
}