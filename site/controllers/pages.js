var moment = require('moment');

var fs = require('fs');  // file system
var msg = "out";
var newSess = 1;
var refresh = false;
var fcheck = false;
var gcheck = false;
var tcheck = false;
var $now = {};
var date = {};
var longUrl = [];
var shortUrl = [];
var displayUrl = [];
var usr, sub, post, url, anchor, linkColor, month, ms, d, s, createdNum = '';

function urlify(text, linkColor, longUrl, shortUrl, displayUrl) {
	console.log('urlify');
	var urlRegex = /(https?:\/\/[^\s]+)/g;
	return text.replace(urlRegex, function(url) {
		for(var j=0;j<shortUrl.length;j++){
			if(url === shortUrl[j]){
				anchor = '<a style="color:#'+linkColor+'" href="'+url+'" target="_blank">'+displayUrl[j]+'</a>';
			}else{
				anchor = '<a style="color:#'+linkColor+'" href="'+url+'" target="_blank">'+url+'</a>';
			}
			console.log(anchor);
			return anchor;
		}
	});
}

function formatCreated(req, i, src, dateOrig){
	// current time (right now)
	$now.orig = new Date();
	$now.month = $now.orig.getMonth();
	if($now.month < 10 && $now.month > 0){
		$now.month = '0'+($now.month+1);
	}
	$now.day = $now.orig.getDate();
	if($now.day < 10 && $now.day > 0){
		$now.day = '0'+$now.day;
	}
	$now.year = $now.orig.getFullYear();
	$now.hour = $now.orig.getHours();
	if($now.hour < 10 && $now.hour > 0){
		$now.hour = '0'+$now.hour;
	}
	$now.min = $now.orig.getMinutes();
	if($now.min < 10 && $now.min > 0){
		$now.min = '0'+$now.min;
	}
	$now.sec = $now.orig.getSeconds();
	if($now.sec < 10 && $now.sec > 0){
		$now.sec = '0'+$now.sec;
	}
	$now.str = $now.day+'/'+$now.month+'/'+$now.year+' '+$now.hour+':'+$now.min+':'+$now.sec;

	// date of post
	date.orig = new Date(dateOrig);
	date.month = date.orig.getMonth();
	if(date.month < 10 && date.month > 0){
		date.month = '0'+(date.month+1);
	}
	date.day = date.orig.getDate();
	if(date.day < 10 && date.day > 0){
		date.day = '0'+date.day;
	}
	date.year = date.orig.getFullYear();
	date.hour = date.orig.getHours();
	if(date.hour < 10 && date.hour > 0){
		date.hour = '0'+date.hour;
	}
	date.min = date.orig.getMinutes();
	if(date.min < 10 && date.min > 0){
		date.min = '0'+date.min;
	}
	date.sec = date.orig.getSeconds();
	if(date.sec < 10 && date.sec > 0){
		date.sec = '0'+date.sec;
	}
	date.str = date.day+'/'+date.month+'/'+date.year+' '+date.hour+':'+date.min+':'+date.sec;

	// time difference
	ms = moment($now.str,"DD/MM/YYYY HH:mm:ss").diff(moment(date.str,"DD/MM/YYYY HH:mm:ss"));
	d = moment.duration(ms);
	s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");

	// change month from num to str
	switch(date.month){
		case '01':
			month = 'Jan';
			break;
		case '02':
			month = 'Feb';
			break;
		case '03':
			month = 'Mar';
			break;
		case '04':
			month = 'Apr';
			break;
		case '05':
			month = 'May';
			break;
		case '06':
			month = 'June';
			break;
		case '07':
			month = 'July';
			break;
		case '08':
			month = 'Aug';
			break;
		case '09':
			month = 'Sep';
			break;
		case '10':
			month = 'Oct';
			break;
		case '11':
			month = 'Nov';
			break;
		case '12':
			month = 'Dec';
			break;
	}

	// format created string to be displayed
	if(d._data.days<1){
		if(d._data.hours==0){
			if(d._data.minutes==0){
				var created = d._data.seconds+'sec';
			}else{
				var created = d._data.minutes+'min '+d._data.seconds+'sec';
			}
		}else if(d._data.hours==1){
			var created = d._data.hours+'hr '+d._data.minutes+'min '+d._data.seconds+'sec';
		}else if(d._data.hours>1){
			var created = d._data.hours+'hrs '+d._data.minutes+'min '+d._data.seconds+'sec';
		}
	}else{
		var created = month+' '+date.day;
	}

	createdNum = date.orig.toUTCString();

	return created;
}

function sessionBuilder(req,res){
	msg = "in";
	console.log("");
	console.log("");
	console.log("session accounts: ");
	console.log(req.session.accounts.twitter);

	req.session.user.twtActive = req.session.accounts.twitter.active;

	console.log("");
	console.log("");
	console.log("session user: ");
	console.log(req.session.user);

	var page = sub + req.params.page;

	if(req.session.accounts){
		if(req.session.accounts.twitter){
			req.session.accounts.twitter.feed = [];
			for(var i=0;i<req.session.accounts.twitter.tweets.length;i++){
				if(newSess){
					linkColor = req.session.accounts.twitter.tweets[i].user.profile_link_color;
					if(req.session.accounts.twitter.tweets[i].entities.urls.length > 0){
						longUrl = [];
						shortUrl = [];
						displayUrl = [];
						for(var j=0;j<req.session.accounts.twitter.tweets[i].entities.urls.length;j++){
							longUrl.push(req.session.accounts.twitter.tweets[i].entities.urls[j].expanded_url);
							shortUrl.push(req.session.accounts.twitter.tweets[i].entities.urls[j].url);
							displayUrl.push(req.session.accounts.twitter.tweets[i].entities.urls[j].display_url);
						}
					}
					req.session.accounts.twitter.tweets[i].text = urlify(req.session.accounts.twitter.tweets[i].text, linkColor, longUrl, shortUrl, displayUrl);
					console.log(req.session.accounts.twitter.tweets[i].text);
				}
				req.session.accounts.twitter.tweets[i].created = formatCreated(req, i, 'tweets', req.session.accounts.twitter.tweets[i].created_at);
				req.session.accounts.twitter.tweets[i].time_lapse = ms;
				req.session.accounts.twitter.tweets[i].createdNum = createdNum;
				req.session.accounts.twitter.feed.push(req.session.accounts.twitter.tweets[i]);
			}
			for(var i=0;i<req.session.accounts.twitter.timeline.length;i++){
				if(newSess){
					linkColor = req.session.accounts.twitter.timeline[i].user.profile_link_color;
					if(req.session.accounts.twitter.timeline[i].entities.urls.length > 0){
						longUrl = [];
						shortUrl = [];
						displayUrl = [];
						for(var j=0;j<req.session.accounts.twitter.timeline[i].entities.urls.length;j++){
							longUrl.push(req.session.accounts.twitter.timeline[i].entities.urls[j].expanded_url);
							shortUrl.push(req.session.accounts.twitter.timeline[i].entities.urls[j].url);
							displayUrl.push(req.session.accounts.twitter.timeline[i].entities.urls[j].display_url);
						}
					}
					req.session.accounts.twitter.timeline[i].text = urlify(req.session.accounts.twitter.timeline[i].text, linkColor, longUrl, shortUrl, displayUrl);
					console.log(req.session.accounts.twitter.timeline[i].text);
				}
				req.session.accounts.twitter.timeline[i].created = formatCreated(req, i, 'timeline', req.session.accounts.twitter.timeline[i].created_at);
				req.session.accounts.twitter.timeline[i].time_lapse = ms;
				req.session.accounts.twitter.timeline[i].createdNum = createdNum;
				req.session.accounts.twitter.feed.push(req.session.accounts.twitter.timeline[i]);
			}
			setTimeout(function(){
				newSess = 0;
			}, 100);
			if(req.session.accounts.twitter.feed){
				// sort the feed
				// req.session.accounts.twitter.feed.sort(function(a,b){return parseFloat(a.createdNum) - parseFloat(b.createdNum)});
				req.session.accounts.twitter.feed.sort(function (a, b) {
					if (a.createdNum > b.createdNum) {
						return -1;
					}
					if (a.createdNum < b.createdNum) {
						return 1;
					}
					// a must be equal to b
					return 0;
				});

				if(req.session.accounts.google){
					res.render(page, {
						message: req.params.id,
						user: req.session.user,
						twitter: req.session.accounts.twitter,
						google: req.session.accounts.google
					});
				}else{
					res.render(page, {
						message: req.params.id,
						user: req.session.user,
						twitter: req.session.accounts.twitter,
						google: ''
					});
				}
			}
		}
		if(req.session.accounts.google){
			res.render(page, {
				message: req.params.id,
				user: req.session.user,
				twitter: '',
				google: req.session.accounts.google
			});
		}
	}else{
		res.render(page, {
			message: req.params.id,
			user: req.session.user,
			twitter: '',
			google: ''
		});
	}
}


module.exports = function(){
	//	Define root route action
	app.get('/',function(req, res){
		if(req.session.user){
			console.log('user logged in');
			res.redirect('dash');
		}else{
			console.log('user logged out');
			msg = "out";
			res.render('index', {user: req.user});
		}
	});

	app.get('/logout', function(req, res){
		req.session.destroy();
		console.log('logout');
		res.redirect('/');
	});

	//	Render template action for all pages
	app.get('/:page', function(req, res){
		console.log('general');
		if(fs.existsSync('views/' + req.params.page + '.ejs')){
			if(req.session.user != undefined){
				if(refresh){
					console.log('|||||| ------------- REFRESH ------------- ||||||');
					refresh = false;
					if(req.session.user.twtId != null){
						res.redirect('/twitter/users/lookup');
					}else if(req.session.user.gId != null){
						res.redirect('/google/activities/list');
					}
				}else{
					sub = '';
					if(req.session.user.fbId != null && req.session.accounts.facebook != null){
						console.log('facebook');
						fcheck=true;
					}else if(req.session.user.fbId != null && req.session.accounts.facebook == null){
						console.log('facebook login');
						res.redirect('/auth/facebook');
					}else{
						fcheck=true;
					}

					if(req.session.user.twtId != null && req.session.accounts.twitter != null){
						console.log('twitter');
						tcheck=true;
					}else if(req.session.user.twtId != null && req.session.accounts.twitter == null){
						console.log('twitter login');
						res.redirect('/auth/twitter');
					}else{
						tcheck=true;
					}

					if(req.session.user.gId != null && req.session.accounts.google != null){
						console.log('google');
						gcheck=true;
					}else if(req.session.user.gId != null && req.session.accounts.google == null){
						console.log('google login');
						res.redirect('/auth/google');
					}else{
						gcheck=true;
					}


					if(req.session.fbActive != undefined){
						req.session.user.fbActive = req.session.fbActive
					}
					if(req.session.twtActive != undefined){
						req.session.user.twtActive = req.session.twtActive
						console.log('twt Active: '+req.session.user.twtActive)
					}
					if(req.session.gActive != undefined){
						req.session.user.gActive = req.session.gActive
					}

					refresh = true;

					console.log('');
					console.log('req.session.accounts.timeline');
					console.log(req.session.accounts.twitter.timeline);
					console.log('');
					if(fcheck && tcheck && gcheck){
						sessionBuilder(req,res,sub);
					}
				}
			}else{
				msg = "out";
				if(req.params.page == 'dash'){
					res.redirect('/');
				}else{
					res.render(req.params.page, {message: msg, user: usr});
				}
			}
		}else{
			res.render('404');
		}
	});

	app.get('/profile/:page', function(req, res){
		console.log('profile');
		if(fs.existsSync('views/profile/' + req.params.page + '.ejs')){
			if(req.session.user != undefined){
				sub = 'profile/';
				setTimeout(function(){
					sessionBuilder(req,res,sub);
				}, 300);
			}else{
				msg = "out";
				if(req.params.page == 'dash'){
					res.redirect('/');
				}else{
					res.render(req.params.page, {message: msg, user: usr});
				}
			}
		}else{
			res.render('404', {message: msg, user: usr});
		}
	});
}