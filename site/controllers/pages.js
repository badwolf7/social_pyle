var fs = require('fs');  // file system

module.exports = function(){
	//	Define root route action
	app.get('/',function(req, res){
		res.render('index', {user: req.user});
	});

	//	Render template action for all pages
	app.get('/:page', function(req, res){
		if(fs.existsSync('views/' + req.params.page + '.ejs')){
			res.render(req.params.page, {message: req.params.id});
		}else{
			res.render('404');
		}
	});
}