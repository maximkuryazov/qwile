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
			added: Boolean,
			image: String

		});

		private.WidgetModel = mongoose.model("Widget", widgetSchema);

		var widgetsUsersSchema = private.mongoose.Schema({

			widget: String,
			user: String

		});

		private.WidgetsUsersModel = private.mongoose.model("Widgets-user", widgetsUsersSchema);

	}

	constructor.prototype = {

		getAllWidgets: function (currentUserId, callback) {
			private.WidgetModel.find({}, function (error, documents) {
				if (!error) {
					callback(documents);
				} else {
					console.error("Error in getAllWidgets: ", error);
				}
			});
		}
		
	};
	
	return constructor;

})();