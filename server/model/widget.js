/**
 * Created by User on 3/17/2017.
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

		var widgetSchema = mongoose.Schema({

			name: String,
			title: String,
			image: String

		});

		private.WidgetModel = mongoose.model("Widget", widgetSchema);

		var widgetsUsersSchema = mongoose.Schema({

			widget: String,
			user: String

		});

		private.WidgetsUsersModel = mongoose.model("Widgets-user", widgetsUsersSchema);

	}

	constructor.prototype = {

		getAllWidgets: function (currentUserId, callback) {
			private.WidgetModel.find({}, function (error, widgets) {
				if (!error) {
					private.WidgetsUsersModel.find({
						user: currentUserId
					}, function (error, relations) {
						if (!error) {

							widgets.forEach(function (widget) {
								relations.forEach(function (relation) {
									if (relation.widget == widget._id) {
										widget.added = true;
									}
								});
							});
							callback(widgets);

						} else {
							console.error("Error in getAllWidgets/relation: ", error);
						}
					});
				} else {
					console.error("Error in getAllWidgets: ", error);
				}
			});
		},
		
		install: function (userId, widgetId, callback) {
			private.WidgetsUsersModel.findOne({

				widget: widgetId,
				user: userId

			}, function (error, relation) {
				if (!error) {
					if (relation) {
						callback(relation, "Document already exists.");
					} else {

						var relationship = new private.WidgetsUsersModel({

							widget: widgetId,
							user: userId

						});
						relationship.save(function (error, relation) {

							if (!error) callback(relation);
							else callback(relation, error);

						});

					}
				}
			})
		},

		getInstalled: function (userId, callback) {
			private.WidgetsUsersModel.find({
				user: userId
			}, function (error, relations) {
				if (!error) {

					var ids = [];
					relations.forEach(function (item) {
						ids.push(private.mongoose.Types.ObjectId(item.widget));
					});

					private.WidgetModel.find({
						"_id": {
							$in: ids
						}
					}, function (error, widgets) {

						if (!error) callback(widgets);
						else callback([], error);

					});

				} else {
					console.log("Error in getInstalled: ", error);
				}
			});
		},

		uninstall: function (widgetId, userId, callback) {
			private.WidgetsUsersModel.remove({

				widget: widgetId,
				user: userId

			}, function (error, removedCount) {
				if (!error) {

					console.log("Removed object: ", removedCount);
					if (removedCount.result.n == 1) {
						callback.call(this, removedCount);
					} else {
						callback.call(this);
					}

				} else {
					callback.call(this, removedCount, error);
				}
			});
		}
		
	};
	
	return constructor;

})();