/**
 * Created by User on 2/3/2017.
 */

module.exports = (function() {

	const util = require('util');
	const crypto = require('crypto');
	const fs = require('fs');
	const _dir = './storage';

	const private = {
		
		mongoose: {},
		db: {}
		
	};

	function constructor (mongoose, db) {
		
		private.mongoose = mongoose;
		this.data = {};

		var userSchema = mongoose.Schema({

			email: String,
			password: String,
			firstname: String,
			lastname: String,
			middlename: String,
			gender: String,
			age: Number,
			birthday: Date,
			sound: Boolean,
			animations: Boolean,
			visible: Boolean,
			activated: Boolean,
			activationCode: Number,
			restoreCode: Number,
			image: String,
			apps: Array

		});

		userSchema.methods.showData = function () {
			console.log("Email: " + this.email);
		};

		private.UserModel = mongoose.model("User", userSchema);
		private.db = db;

	}

	constructor.prototype = {

		getByMail: function (email, callback) {
			private.UserModel.findOne({ email: email }, function (error, doc) {

				if (!error) callback(doc);
				else console.log("Error " + error + " occurred.");

			});
		},

		remove: function (id, callback) {
			private.UserModel.remove({ "_id": id }, function (error) {
				if (!error) {

					console.log("User with id " + id + "had been removed.");
					callback();

				} else {
					
					console.log("Error " + error + " occurred during the deletion.");
					callback(error);
					
				}
			});
		},

		create: function (data) {

			var mongoose = private.mongoose;
			this.data = data;

			var currentUser = new private.UserModel({

				email: this.data.email,
				password: crypto.createHash('md5').update(this.data.password).digest("hex"),
				age: 27,
				birthday: new Date(),
				activated: false,
				activationCode: this.data.activationCode

			});

			currentUser.save(function (error, currentUser) {

				if (error) return console.error(error);
				currentUser.showData();
				if (!fs.existsSync(_dir + '/' + currentUser._id)){

					fs.mkdirSync(_dir + '/' + currentUser._id);
					fs.mkdirSync(_dir + '/' + currentUser._id + '/__profile');

				}

			});

			private.UserModel.find(function (error, users) {

				if (error) return console.error(error);
				console.log("Users: " + users);
				for (var key in users) {
					console.log("Email: " + users[key].email);
					console.log("ID: " + users[key]._id);
				}

			});

		},
		
		set: function (id, options, callback) {

			console.log(util.inspect(options, false, null));

			private.UserModel.update({ _id: id }, {
				$set: options,
			}, function (error, affected) {

				console.log("User set error: ", error);
				console.log("User set affected: ", affected);
				callback(affected, error);
				
			});

		}
	};
	return constructor;

})();