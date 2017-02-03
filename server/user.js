/**
 * Created by User on 2/3/2017.
 */

module.exports = (function() {

	const util = require('util');

	const private = {
		mongoose: {},
		db: {}
	};

	function constructor(mongoose, db) {
		
		private.mongoose = mongoose;
		this.data = {};

		var userSchema = mongoose.Schema({
			email: String,
			password: String,
			firstname: String,
			lastname: String,
			middlename: String,
			age: Number,
			birthday: Date,
			sound: Boolean,
			animations: Boolean,
			visible: Boolean
		});

		userSchema.methods.showData = function () {
			console.log("Email: " + this.email);
		};

		private.UserModel = mongoose.model('User', userSchema);
		private.db = db;

	}

	constructor.prototype = {

		remove: function(id) {
			private.UserModel.remove({ "_id": id }, function(error) {
				if (!error) {
					console.log("User with id " + id + "had been removed.");
				} else {
					console.log("Error " + error + " occurred during the deletion.");
				}
			});
		},

		create: function(data) {

			var mongoose = private.mongoose;
			this.data = data;

			var currentUser = new private.UserModel({
				email: this.data.email,
				password: this.data.password,
				age: 27,
				birthday: new Date()
			});

			currentUser.save(function (error, currentUser) {
				if (error) return console.error(error);
				currentUser.showData();
			});

			private.UserModel.find(function (error, users) {
				if (error) return console.error(error);
				console.log("Users: " + users);
				for (var key in users) {
					console.log("Email: " + users[key].email);
					console.log("ID: " + users[key]._id);
				}
			});

		}
	};
	return constructor;

})();