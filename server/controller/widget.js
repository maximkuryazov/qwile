/**
 * Created by User on 3/17/2017.
 */

module.exports = (function () {

	let WidgetModel = require("../model/widget");
	var private = {}
	
	function WidgetConstructor (app, user, mongoose, db) {

		private.widgetModel = new WidgetModel(mongoose, db);
		app.put("/widget/install", this.install);
		
	}

	WidgetConstructor.prototype = {

		getAllWidgets: function (currentUserId, callback) {
			private.widgetModel.getAllWidgets(currentUserId, callback);
		},

		install: function (req, res) {

			console.log("Widget ID: ", req.body.id);
			res.setHeader("Content-Type", "application/json");
			private.widgetModel.install(req.session.currentUserId, req.body.id, function (relation, error) {
				if (!error) {

					console.log("Inserted document: ", relation);
					res.status(200).send(JSON.stringify({
						success: true
					}));

				} else {

					console.log(error);
					res.status(503).send(JSON.stringify({

						success: false,
						error: error

					}));
				}
			});

		}
		
	} 
	
	return WidgetConstructor;
	
})();