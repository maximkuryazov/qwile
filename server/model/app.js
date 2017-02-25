/**
 * Created by User on 2/21/2017.
 */

module.exports = (function() {

	const private = {
		
		mongoose: {},
		db: {}
		
	};

	function constructor (mongoose, db) {

		private.mongoose = mongoose;
		private.db = db;

		var appSchema = mongoose.Schema({

			name: String,
			icon: String,
			description: String,
			developer: String,
			rating: Number,
			iframe: Boolean,
			scroll: Boolean
			
		});
		
		private.AppModel = mongoose.model("App", appSchema);

		var appsUsersSchema = private.mongoose.Schema({

			app: String,
			user: String

		});
		private.AppsUsersModel = private.mongoose.model("Apps-user", appsUsersSchema);

	}

	constructor.prototype = {

		getAppById: function (id, callback) {
			private.AppModel.findOne({ _id: id }, function (error, document) {

				if (!error) callback.call(this, document);
				else {

					console.log("Error " + error + " occurred.");
					callback.call(this, document, error);

				}

			});
		},

		getAllApps: function (callback) {
			private.AppModel.find({}, function (error, documents) {

				if (!error) callback.call(this, documents);
				else {

					console.log("Error " + error + " occurred.");
					callback.call(this, documents, error);

				}

			}).limit(20);
		},

		add: function (userId, appId, callback) {
			private.AppsUsersModel.findOne({

				app: appId,
				user: userId

			}, function (error, document) {
				if (!error) {
					if (document) {
						callback(document, "Document already exists.");
					} else {

						var relationship = new private.AppsUsersModel({

							app: appId,
							user: userId

						});
						relationship.save(function (error, document) {

							if (!error) callback(document);
							else callback(document, error);

						});

					}
				}
			});
		}

	};
	return constructor;
		
})();