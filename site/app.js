var fs = require('fs');  // file system
var os = require('os');  // operating system
var path = require('path');

// Application Utilities
var express = require('express');
var engine = require('ejs-locals');
var expressSession = require('express-session');
var cluster = require('cluster');
var http = require('http');

var include = [".js", ".coffee", ".cljs"];

// Skeleton of and Application
global.app = express();

// Adding httpServer to Skeleton
var httpServer = http.createServer(app);
	
// set port
var port = process.env.PORT || 3000;
global.hotlinks = {};

app.engine('ejs', engine);
app.locals.pretty = true;

global.load = {
	auth: function (req, res, next){
		if(!req.session.user){
			req.session.direction = req.originalUrl;
			res.redirect('/');
		}else{
			next();
		}
	},
	page: function(req,res,next){
		var view = req.params["0"].split("/")[1];
		if(hotlinks[view] &&  req.params["0"].split("/").length <= 2){
			res.redirect(hotlinks[view]);
		}else if(view === "sitemap.xml"){
			sitemap.toXML( function (xml) {
				res.header('Content-Type', 'application/xml');
				res.send( xml );
			});
		}else{
			next();
		}
	}
};

app.get('*', load.page);

var numCPUs = 1 || process.env.WORKERS || os.cpus().length;

cluster.on('exit', function (worker) {
		// Replace the dead worker,
		// we're not sentimental
		console.log('Worker ' + worker.id + ' died :(');
		cluster.fork();
});

if (cluster.isMaster) {
	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}
} else {
	// Set View Engine to EJS
	app.engine('ejs', engine);

	// set templating engine to ejs (jade sucks)
	app.set('view engine', 'ejs');
	app.use('/views', express.static('/views'));
	app.use('/assets', express.static(__dirname + '/assets'));
	app.use(expressSession({secret: '25054772e4aa4e9ab43f18b1c3ce2299'}));

	// --- Models --- //
	app.models = {};
	fs.readdirSync("./models").forEach(function(file) {
		if(include.indexOf(path.extname(file)) > -1){
			require("./models/" + file)();
		}
	});
	
	// Start up every script in the controllers folder
	fs.readdirSync("./controllers").forEach(function(file) {
		if(include.indexOf(path.extname(file)) > -1){
			require("./controllers/" + file)();
		}
	});

	// 404 ---- Page
	app.get("/*", function(req, res){
		res.render('404');
	});

	// starts server on specified port
	httpServer.listen(port, function(){
		console.log("Port Listening on port "+port);
	});
}