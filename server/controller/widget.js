/**
 * Created by User on 3/17/2017.
 */

module.exports = (function () {

	let WidgetModel = require("../model/widget");
	var private = {}
	
	function WidgetConstructor (app, user, mongoose, db) {

		private.widgetModel = new WidgetModel(mongoose, db);
		
	}

	WidgetConstructor.prototype = {

		getAllWidgets: function (currentUserId, callback) {
			private.widgetModel.getAllWidgets(currentUserId, callback);
		}
		
	} 
	
	return WidgetConstructor;
	
})();