//	Passport
var passport = require('passport');
//  Passport Facebook
var FacebookStrategy = require('passport-facebook').Strategy;
//  Facebook API
var graph = require('fbgraph');

//	Configure FB connect method
var FACEBOOK_APP_ID = '1007034979322153';
var FACEBOOK_APP_SECRET = 'f8478c7f34e451b27e3b1c118437ff8a';

module.exports = function(){
	app.get('/facebook/info', function(req,res,next){
		graph.setAccessToken(req.session.accounts.facebook.accessToken);
		
		graph.get('/me', function(err,prof){
			if(err){
				console.log(err);
			}else{
				console.log('');
				console.log('');
				console.log('FB Profile:');
				console.log(prof);

				res.redirect('/facebook/feed');
			}
		});
	});
	app.get('/facebook/feed', function(req,res,next){
		graph.setAccessToken(req.session.accounts.facebook.accessToken);
		
		graph.get('/me/feed', function(err,feed){
			if(err){
				console.log(err);
			}else{
				console.log('');
				console.log('');
				console.log('FB Feed:');
				console.log(feed);
				res.json(feed);
				// res.redirect('/dash');
			}
		});
	});
}