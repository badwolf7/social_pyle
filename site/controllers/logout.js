module.exports = function(){
	// logout
	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});
}