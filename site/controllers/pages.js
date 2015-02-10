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
			console.log(req.session.user);
			if(req.session.user != undefined){
				msg = "in";
				console.log("session user: ");
				console.log(req.session.user);
				res.render(req.params.page, {message: req.params.id, user: req.session.user});
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