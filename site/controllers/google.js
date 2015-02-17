//  Passport Google
var GoogleStrategy = require('passport-google-oauth2');
var google = require('googleapis');
var plus = google.plus('v1');
var OAuth2 = google.auth.OAuth2;

// Google App Data
var GOOGLE_CLIENT_ID = '1044666733227-4u3rtup7s601l651q0ntti5itnpfr1h0.apps.googleusercontent.com';
var GOOGLE_CLIENT_EMAIL = '1044666733227-4u3rtup7s601l651q0ntti5itnpfr1h0@developer.gserviceaccount.com';
var GOOGLE_CLIENT_SECRET = 'FEMCRgUb8rlz76wg-jpYlRZp';

var oauth2Client = new OAuth2(GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,'/google/people/get');

module.exports = function(){
	app.get( '/google/people/get',
		function(req, res){
			console.log('');
			console.log('');
			console.log('|||||||||||||||||||||  /google/people/get');
			oauth2Client.setCredentials({
				access_token: req.session.accounts.google.accessToken,
				refresh_token: req.session.accounts.google.refreshToken
			});

			plus.people.get({userId: 'me', auth: oauth2Client}, function(err,response){
				if(!err){
					console.log(response);
					req.session.accounts.google.user = response;
					res.redirect('/google/people/connected/list');
				}else{
					console.log(err);
				}
			});
		}
	);
	app.get( '/google/people/connected/list',
		function(req, res){
			// List friends that are connected
			req.session.accounts.google.people = {};
			console.log('');
			console.log('');
			console.log('|||||||||||||||||||||  /google/people/connected/list');
			// collection:  Allowed values: [connected, visible]
			plus.people.list({userId: 'me', collection: 'connected', auth: oauth2Client}, function(err,response){
				if(!err){
					console.log(response);
					req.session.accounts.google.people.connected = response;
					res.redirect('/google/people/visible/list');
				}else{
					console.log(err);
				}
			});
		}
	);
	app.get( '/google/people/visible/list',
		function(req, res){
			// List friends that are visible
			console.log('');
			console.log('');
			console.log('|||||||||||||||||||||  /google/people/visible/list');
			// collection:  Allowed values: [connected, visible]
			plus.people.list({userId: 'me', collection: 'visible', auth: oauth2Client}, function(err,response){
				if(!err){
					console.log(response);
					req.session.accounts.google.people.visible = response;
					res.redirect('/google/people/activities/list');
				}else{
					console.log(err);
				}
			});
		}
	);
	app.get( '/google/people/activities/list',
		function(req, res){
			// List friends that are online
			req.session.accounts.google.activities = {};
			console.log('');
			console.log('');
			console.log('|||||||||||||||||||||  /google/activities');
			// collection:  Allowed values: [connected, visible]
			plus.activities.list({userId: 'me', collection: 'public', auth: oauth2Client}, function(err,response){
				if(!err){
					console.log(response);
					req.session.accounts.google.activities = response;
					res.redirect('/google/people/moments/list');
				}else{
					console.log(err);
				}
			});
		}
	);
	app.get( '/google/people/comments/list',
		function(req, res){
			// List comments for a specific activity
			req.session.accounts.google.comments = {};
			console.log('');
			console.log('');
			console.log('|||||||||||||||||||||  /google/people/comments');
			
			plus.comments.list({activityId: 'ACTIVITY ID', auth: oauth2Client}, function(err,response){
				if(!err){
					console.log(response);
					req.session.accounts.google.comments = response;
					res.redirect('/google/people/moments/list');
				}else{
					console.log(err);
				}
			});
		}
	);
	app.get( '/google/people/moments/list',
		function(req, res){
			// List of moments
			req.session.accounts.google.moments = {};
			console.log('');
			console.log('');
			console.log('|||||||||||||||||||||  /google/people/moments');
			// collection:  Allowed values: [vault]
			plus.moments.list({userId: 'me', collection: 'vault', auth: oauth2Client}, function(err,response){
				if(!err){
					console.log(response);
					req.session.accounts.google.moments = response;
					res.redirect('/dash');
				}else{
					console.log(err);
				}
			});
		}
	);
}