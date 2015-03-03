//  Passport Google
var GoogleStrategy = require('passport-google-oauth2');
var google = require('googleapis');
var plus = google.plus('v1');
var plusDomains = google.plusDomains('v1');
var OAuth2 = google.auth.OAuth2;

// Google App Data
var GOOGLE_CLIENT_ID = '1044666733227-4u3rtup7s601l651q0ntti5itnpfr1h0.apps.googleusercontent.com';
var GOOGLE_CLIENT_EMAIL = '1044666733227-4u3rtup7s601l651q0ntti5itnpfr1h0@developer.gserviceaccount.com';
var GOOGLE_CLIENT_SECRET = 'FEMCRgUb8rlz76wg-jpYlRZp';
var GOOGLE_API_KEY = 'AIzaSyDHR0JyuKfK58z0K1JHoQc0y8IG-HBCdUw';

var visiblePeople = ['me'];

var oauth2Client = new OAuth2(GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,'/google/people/get');

module.exports = function(){
	app.get( '/google/people/get',
		function(req, res){
			console.log('');
			console.log('');
			console.log('|||||||||||||||||||||  google.user');
			oauth2Client.setCredentials({
				access_token: req.session.accounts.google.oauth.accessToken,
				refresh_token: req.session.accounts.google.oauth.refreshToken
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
			console.log('|||||||||||||||||||||  google.people.connected');
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
			console.log('|||||||||||||||||||||  google.people.visible');
			// collection:  Allowed values: [connected, visible]
			plus.people.list({userId: 'me', collection: 'visible', auth: oauth2Client}, function(err,response){
				if(!err){
					console.log(response);
					req.session.accounts.google.people.visible = response;

					for(var i=0;i<response.length;i++){
						visiblePeople.push(response[i].id);
					}

					res.redirect('/google/activities/list');
				}else{
					console.log(err);
				}
			});
		}
	);
	app.get( '/google/activities/list',
		function(req, res){
			// List friends that are online
			req.session.accounts.google.activities = {};
			console.log('');
			console.log('');
			console.log('|||||||||||||||||||||  google.activities');
			// collection:  Allowed values: [connected, visible]
			plus.activities.list({userId: 'me', collection: 'public', auth: oauth2Client}, function(err,response){
				if(!err){
					console.log(response);
					console.log('');
					if(response.items.length < 0){
						console.log(response.items);
						console.log('');
						console.log(response.items[0].actor);
						console.log('');
						console.log(response.items[0].object);
						console.log('');
						console.log(response.items[0].object.attachments);
						console.log('');
					}
					req.session.accounts.google.activities = response;
					res.redirect('/google/moments/list');
				}else{
					console.log(err);
				}
			});
		}
	);
	app.get( '/google/comments/list',
		function(req, res){
			// List comments for a specific activity
			req.session.accounts.google.comments = {};
			console.log('');
			console.log('');
			console.log('|||||||||||||||||||||  google.comments');
			
			plus.comments.list({activityId: 'ACTIVITY ID', auth: oauth2Client}, function(err,response){
				if(!err){
					console.log(response);
					req.session.accounts.google.comments = response;
					res.redirect('/google/moments/list');
				}else{
					console.log(err);
				}
			});
		}
	);
	app.get( '/google/moments/list',
		function(req, res){
			// List of moments
			req.session.accounts.google.moments = {};
			console.log('');
			console.log('');
			console.log('|||||||||||||||||||||  google.moments');
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
	app.get('/google/audiences/list',
		function(req,res){
			// List of moments
			req.session.accounts.google.audiences = {};
			console.log('');
			console.log('');
			console.log('|||||||||||||||||||||  google.audiences');

			plusDomains.audiences.list({userId: 'me', key: GOOGLE_API_KEY}, function(err,response){
				if(!err){
					console.log(response);
					req.session.accounts.google.audiences = response;
					res.redirect('/google/circles/list');
				}else{
					console.log(err);
				}
			});
		}
	);
	app.get('/google/circles/list',
		function(req,res){
			// List of circles
			req.session.accounts.google.circles = {};
			console.log('');
			console.log('');
			console.log('|||||||||||||||||||||  google.circles');
			plusDomains.circles.list({userId: 'me', key: GOOGLE_API_KEY}, function(err,response){
				if(!err){
					console.log(response);
					req.session.accounts.google.circles = response;
					res.redirect('/dash');
				}else{
					console.log(err);
				}
			});
		}
	);
}