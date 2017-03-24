/**
 * Created by User on 2/3/2017.
 */

module.exports = (function() {

	const util = require("util");
	const crypto = require("crypto");
	const fs = require("fs");
	const _dir = "./storage";

	const private = {
		
		mongoose: {},
		db: {}
		
	};

	function Constructor (mongoose, db) {
		
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
			activated: Boolean,
			activationCode: Number,
			restoreCode: Number,
			online: Boolean,

			// юзер сохраняется раньше чем настройка, поэтому он не может положить айди настройки к себе,
			// т.к. на тот момент её ещё нету, поэтому пустой массив. Надо положить айди настройки сюда через update повторным запросом.
			settings: [{

				type: mongoose.Schema.Types.ObjectId,
				ref: "Setting"

			}]

		});

		var settingSchema = mongoose.Schema({

			sound: Boolean,
			animations: Boolean,
			visible: Boolean,
			security: Boolean,
			popups: Boolean,
			wallpaper: String,

			_owner: {

				type: mongoose.Schema.Types.ObjectId,
				ref: "User"

			}

		});

		userSchema.methods.showEmail = function () {
			console.log("Email: " + this.email);
		};

		var User = mongoose.model("User", userSchema);
		var Setting = mongoose.model("Setting", settingSchema);

		private.UserModel = User;
		private.SettingModel = Setting;

		private.db = db;

	}

	Constructor.prototype = {

		getByMail: function (email, callback) {
			private.UserModel.findOne({ email: email }, function (error, doc) {

				if (!error) callback(doc);
				else console.log("Error " + error + " occurred.");

			});
		},

		getById: function (id, callback) {
			private.UserModel.findOne({ _id: id }, function (error, doc) {

				if (!error) callback(doc);
				else console.log("Error " + error + " occurred.");

			}).populate("settings").exec(function (error, user) {
				console.log("Populated user: ", user);
			});
		},

		remove: function (id, callback) {
			private.UserModel.remove({ "_id": id }, function (error) {
				if (!error) {

					var rimraf = require("rimraf");
					rimraf(_dir + "/" + id, function () {

						console.log("User with id " + id + "had been removed.");
						callback();

					});
					
				} else {
					
					console.log("Error " + error + " occurred during the deletion.");
					callback(error);
					
				}
			});
		},

		create: function (data) {

			var mongoose = private.mongoose;
			this.data = data;

			var setting = new private.SettingModel({

				sound: true,
				animations: true,
				visible: true,
				security: true,
				popups: true,
				wallpaper: true,
				_owner: private.mongoose.Types.ObjectId(0)

			});

			var _ = require("underscore-node");
			setting.save(_.bind(function (error, settingDocument) {

				var currentUser = new private.UserModel({

					email: this.data.email,
					password: crypto.createHash("md5").update(this.data.password).digest("hex"),
					age: 27,
					birthday: new Date(),
					activated: false,
					activationCode: this.data.activationCode,
					settings: [setting._id]

				});

				currentUser.save(function (error, currentUser) {

					if (error) return console.error(error);
					currentUser.showEmail();

					private.SettingModel.update({ _id: settingDocument._id }, {
						$set: {
							sound: false,
							_owner: private.mongoose.Types.ObjectId(currentUser._id)
						}
					}, function (error, updated) {

						if (error) console.log("Error in setting.update: ", error);
						else {

							console.log("Обновляем настройку!");

							if (!fs.existsSync(_dir + "/" + currentUser._id)) {

								fs.mkdirSync(_dir + "/" + currentUser._id);
								fs.mkdirSync(_dir + "/" + currentUser._id + "/__profile");
								var writeStream = fs.createWriteStream(_dir + "/" + currentUser._id + "/__profile/_currentPhoto.jpg");
								fs.createReadStream("./client/img/no-photo.jpg").pipe(writeStream);

							}
						}

					});

				});

				private.UserModel.find(function (error, users) {

					if (error) return console.error(error);
					console.log("Users: " + users);
					for (var key in users) {

						console.log("Email: " + users[key].email);
						console.log("ID: " + users[key]._id);

					}

				});

			}, this));

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

		},
		
		get: function (id, property, callback) {
			this.getById(id, function (document) {
				callback.call(document, document[property]);
			});
		},

		getPhoto : function (file, currentUserId, callback) {
			fs.readFile("storage/" + currentUserId + "/__profile/" + file, function (error, data) {

				if (error) {
					return console.log(error);
				}
				console.log(data);
				callback(data);

			});
		}
		
	};
	return Constructor;

})();