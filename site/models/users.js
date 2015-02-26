var Sequelize = require("sequelize");
//Data models for supported logins using passport.
module.exports = function(sequelize){

	//The user model itself.
	app.models.User = sequelize.define('users', {
		'id': {'type': Sequelize.UUID, 'defaultValue': Sequelize.UUIDV4, 'primaryKey': true},
		'active': Sequelize.BOOLEAN,
		'fullName': Sequelize.TEXT,
		'email': Sequelize.STRING,
		'customerToken': Sequelize.UUID,
		'fbId': Sequelize.STRING,
		'twtId': Sequelize.STRING,
		'gId': Sequelize.STRING,
		'pinId': Sequelize.STRING,
		'addressId': Sequelize.INTEGER,
		'phoneId': Sequelize.INTEGER
	});
	
	//The facebook model
	app.models.Facebook = sequelize.define('facebooks', {
		'id': {'type': Sequelize.STRING, 'primaryKey': true},
		'displayName': Sequelize.STRING,
		'fullName': Sequelize.STRING,
		'email': Sequelize.STRING,
		'gender': Sequelize.STRING,
		'profileUrl': Sequelize.TEXT,
		'locale': Sequelize.STRING,
		'timezone': Sequelize.INTEGER,
		'token': Sequelize.STRING,
		'refreshToken': Sequelize.STRING
	});

	//The Google model
	app.models.Google = sequelize.define('googles', {
		'id': {'type': Sequelize.STRING, 'primaryKey': true},
		'displayName': Sequelize.STRING,
		'fullName': Sequelize.STRING,
		'location': Sequelize.STRING,
		'locale': Sequelize.STRING,
		'email': Sequelize.STRING,
		'gender': Sequelize.STRING,
		'profileUrl': Sequelize.TEXT,
		'profileImageUrl': Sequelize.TEXT,
		'token': Sequelize.STRING,
		'refreshToken': Sequelize.STRING
	});

	//The twitter model.
	app.models.Twitter = sequelize.define('twitters', {
		'id': {'type': Sequelize.STRING, 'primaryKey': true},
		'displayName': Sequelize.STRING,
		'fullName': Sequelize.STRING,
		'location': Sequelize.STRING,
		'locale': Sequelize.STRING,
		'timezone': Sequelize.INTEGER,
		'followersCount':Sequelize.INTEGER,
		'friendsCount':Sequelize.INTEGER,
		'listedCount':Sequelize.INTEGER,
		'favouritesCount':Sequelize.INTEGER,
		'statusesCount':Sequelize.INTEGER,
		'profileImageUrl':Sequelize.TEXT,
		'profileImageUrlHttps':Sequelize.TEXT,
		'token': Sequelize.STRING,
		'tokenSecret': Sequelize.STRING
	});

	//The Address model
	app.models.Address = sequelize.define('addresses',{
		'id': {'type': Sequelize.STRING, 'primaryKey': true},
		'addressType': Sequelize.STRING,
		'timezone': Sequelize.STRING,
		'country': Sequelize.STRING,
		'state': Sequelize.STRING
	});

	//The Phone model
	app.models.Phone = sequelize.define('phones',{
		'id': {'type': Sequelize.STRING, 'primaryKey': true},
		'number': Sequelize.INTEGER,
		'numberType': Sequelize.STRING
	});

	//The States model
	app.models.State = sequelize.define('states',{
		'id': {'type': Sequelize.STRING, 'primaryKey': true},
		'state': Sequelize.STRING
	});

		// CreditCard Model
	app.models.CC = sequelize.define('creditCards', {
		'id': {'type': Sequelize.UUID, 'defaultValue': Sequelize.UUIDV4, 'primaryKey': true},
		'token': Sequelize.UUID,
		'brand': Sequelize.STRING,
		'nameOnCard': Sequelize.TEXT,
		'lastFour': Sequelize.INTEGER(4).UNSIGNED,
		'expMonth': Sequelize.INTEGER(2).UNSIGNED,
		'expYear': Sequelize.INTEGER(4).UNSIGNED
	});

	// ######################### Are we Allowing Banks? #########################
	// CreditCard Model
	// app.models.Bank = sequelize.define('bank', {
	// 	token: {type: Sequelize.UUID, primaryKey: true},
	// 	nameOnCard : Sequelize.TEXT,
	// 	lastFour: Sequelize.INTEGER,
	// });

	// Instatiating the relationship to user.
	app.models.User.hasMany(app.models.CC);
	app.models.CC.belongsTo(app.models.User);

	app.models.User.hasMany(app.models.Phone);
	app.models.Phone.belongsTo(app.models.User);

	app.models.User.hasOne(app.models.Facebook);
	app.models.Facebook.belongsTo(app.models.User);
	
	app.models.User.hasOne(app.models.Twitter);
	app.models.Twitter.belongsTo(app.models.User);
	
	app.models.User.hasOne(app.models.Google);
	app.models.Google.belongsTo(app.models.User);
	
	// app.models.User.hasOne(app.models.Reveiws);
	// app.models.Reveiws.belongsTo(app.models.User);

}