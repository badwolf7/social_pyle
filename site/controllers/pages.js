var fs = require('fs');  // file system
var msg = "out";

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
		if(fs.existsSync('views/' + req.params.page + '.ejs')){
			if(req.session.user != undefined){
				msg = "in";
				console.log("");
				console.log("");
				console.log("session user: ");
				console.log(req.session.user);

				if(req.session.accounts){
					if(req.session.accounts.twitter){
						for(var i=0;i<req.session.accounts.twitter.tweets.length;i++){
							req.session.accounts.twitter.timeline.unshift(req.session.accounts.twitter.tweets[i]);
						}
						if(req.session.accounts.twitter.timeline){
							res.render(req.params.page, {
								message: req.params.id,
								user: req.session.user,
								twtTimeline: req.session.accounts.twitter.timeline,
								google: ''
							});
						}
					}
					if(req.session.accounts.google){
						res.render(req.params.page, {
							message: req.params.id,
							user: req.session.user,
							twtTimeline: '',
							google: req.session.accounts.google
						});
					}
				}else{
					res.render(req.params.page, {
						message: req.params.id,
						user: req.session.user,
						twtTimeline: '',
						google: ''
					});
				}
			}else{
				msg = "out";
				if(req.params.page == 'dash'){
					res.redirect('/');
				}else{
					res.render(req.params.page, {message: req.params.id, user: msg});
				}
			}
		}else{
			res.render('404');
		}
	});
}