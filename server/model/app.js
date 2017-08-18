/**
 * Created by User on 2/21/2017.
 */

module.exports = (function () {

	const util = require("util");

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
			scroll: Boolean,
			url: String,
			native: Boolean
			
		});
		
		private.AppModel = mongoose.model("App", appSchema);

		var appsUsersSchema = private.mongoose.Schema({

			app: String,
			user: String,
			voted: Number

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

		getAllApps: function (callback, currentUserId) {
			private.AppModel.find({}, function (error, documents) {

				private.AppsUsersModel.find({
					user: currentUserId
				},
					function (appsUsersError, relationships) {
						if (!appsUsersError) {

							documents.forEach(function (document) {
								relationships.forEach(function (relationship) {
									if (document._id == relationship.app) {
										document.added = true;
									}
								});
							});

							var _ = require("underscore-node");
							documents =_.sortBy(documents, function(object) { return object.added; });

							if (!error) callback.call(this, documents);
							else {

								console.log("Error " + error + " occurred.");
								callback.call(this, documents, error);

							}

						}
				});

			}).limit(10);
		},

		getInstalled: function (currentUserId, callback) {
			private.AppsUsersModel.find({
				user: currentUserId
			}, function (appsUsersError, relationships) {
				if (!appsUsersError) {

					let ids = [];
					relationships.forEach(function (relationship) {
						ids.push(relationship.app);
					});
					private.AppModel.find({
						"_id": {
							$in: ids
						}
					}, function (error, apps) {
						callback(apps, error);
					});

				}
			});
		},

		add: function (userId, appId, callback) {

			// TODO: Refactor (this.getRelation() to use)

			var self = this;
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
						self.getAppById(appId, function (app) {
							relationship.save(function (error, document) {

								if (!error) callback(document, undefined, app);
								else callback(document, error);

							});
						});

					}
				}
			});
		},

		uninstall: function (userId, appId, responseCallback) {
			private.AppsUsersModel.remove({

					app: appId,
					user: userId

				}, function (error, removedCount) {
					responseCallback(error || undefined, removedCount.result.n);
				});
		},

		set: function (id, options, callback) {

			console.log(util.inspect(options, false, null));
			private.AppModel.update({ _id: id }, {
				$set: options,
			}, function (error, affected) {
				callback(affected, error);
			});

		},

		getRelation: function (appId, userId, callback) {
			private.AppsUsersModel.findOne({

				app: appId,
				user: userId

			}, callback);
		},

		setRelationProperty: function (app, user, options, callback) {
			private.AppsUsersModel.update({ 
				
				app: app,
				user: user
				
			}, {
				$set: options,
			}, function (error, affected) {
				callback(affected, error);
			});
		},
		
		getAppsUsersModel: function () {
			return private.AppsUsersModel;
		}

	};
	return constructor;
		
})();