var fs = require('fs');  // file system
var msg = "out";

module.exports = function(){
	//	Define root route action
	app.get('/',function(req, res){
		if(req.session.user){
			res.redirect('dash');
		}else{
			msg = "out";
			res.render('index', {user: req.user});
		}
	});

	app.get('/logout', function(req, res){
		req.logout();
		req.session = null;
		req.session.destroy();
		console.log('logout');
		res.redirect('/');
	});

	//	Render template action for all pages
	app.get('/:page', function(req, res){
		if(fs.existsSync('views/' + req.params.page + '.ejs')){
			if(req.session.user){
				msg = "in";
				console.log("session user: ");
				console.log(req.session.user);
				res.render(req.params.page, {message: req.params.id, user: req.session.user});
			}else{
				msg = "out";
				res.render(req.params.page, {message: req.params.id, user: msg});
			}
		}else{
			res.render('404');
		}
	});
}