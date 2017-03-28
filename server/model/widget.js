/**
 * Created by User on 3/17/2017.
 */

module.exports = (function () {

	const util = require("util");

	const private = {

		mongoose: {},
		db: {}

	};

	function Constructor (mongoose, db) {

		private.mongoose = mongoose;
		private.db = db;

		var widgetSchema = mongoose.Schema({

			name: String,
			title: String,
			image: String,
			path: String

		});

		private.WidgetModel = mongoose.model("Widget", widgetSchema);

		var widgetsUsersSchema = mongoose.Schema({

			widget: String,
			user: String,
			x: Number,
			y: Number

		});

		private.WidgetsUsersModel = mongoose.model("Widgets-user", widgetsUsersSchema);

	}

	Constructor.prototype = {

		get: function (id, callback) {
			private.WidgetModel.findOne({
				_id: id
			}, function (error, widget) {

				if (!error) callback(widget);
				else console.log("Error in model/widget/get: ", error);

			});
		},

		// TODO: We should create method setCords, because set is more general (not only x, y)
		setForUser: function (id, data, callback) {
			private.WidgetsUsersModel.update({

				user: id,
				widget: data._id

			}, {
				$set: {

					x: data.x,
					y: data.y

				}
			}, function (error, affected) {
				callback(affected, error);
			});
		},

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

			var self = this;
			private.WidgetsUsersModel.findOne({

				widget: widgetId,
				user: userId

			}, function (error, relation) {
				if (!error) {
					if (relation) {
						callback(relation, undefined, "Document already exists.");
					} else {

						var relationship = new private.WidgetsUsersModel({

							widget: widgetId,
							user: userId

						});
						relationship.save(function (error, relation) {
							self.get(widgetId, function (widget) {

								if (!error) callback(relation, widget);
								else callback(relation, widget, error);

							});
						});

					}
				}
			});

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
						if (!error) {

							for (var i = 0; i < relations.length; i++) {
								for (var j = 0; j < widgets.length; j++) {

									if (widgets[j]._id == relations[i].widget) {

										widgets[j] = widgets[j].toObject();
										widgets[j].x = relations[i].x;
										widgets[j].y = relations[i].y;

									}
								}
							}
							callback(widgets);

						}
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
		},

		getWidgetsUsersModel: function () {
			return private.WidgetsUsersModel;
		}
		
	};
	
	return Constructor;

})();