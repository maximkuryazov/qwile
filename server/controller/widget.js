/**
 * Created by User on 3/17/2017.
 */

module.exports = (function () {

	let WidgetModel = require("../model/widget");
	var private = {}
	
	function WidgetConstructor (app, user, mongoose, db) {

		private.widgetModel = new WidgetModel(mongoose, db);

		app.put("/widget/install", this.install);
		app.delete("/widget/uninstall", this.uninstall);
		app.get("/widget/getInstalled", this.getInstalled);
		app.get("/widget/getContent", this.getContent);
		app.get("/widget/timeout", this.timeout);

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

		},

		getInstalled: function (req, res) {
			private.widgetModel.getInstalled(req.session.currentUserId, function (widgets, error) {
				
				res.setHeader("Content-Type", "application/json");
				if (!error) {
					res.status(200).send(JSON.stringify({

						success: true,
						widgets: widgets

					}));
				} else {
					res.status(500).send(JSON.stringify({

						success: false,
						errorMessage: error

					}));
				}
				
			});
		},

		uninstall: function (req, res) {
			private.widgetModel.uninstall(req.body.id, req.session.currentUserId, function (count, error) {

				res.setHeader("Content-Type", "application/json");
				if (!error && count) {
					res.status(200).send(JSON.stringify({
						success: true
					}));
				} else {

					console.log("Error in uninstall: ", error);
					res.status(500).send(JSON.stringify({

						success: false,
						errorMessage: error

					}));

				}

			});
		},
			
		getContent: function (req, res) {
			res.render("widgets/" + req.query.path);
		},

		timeout: (req, res) => {

		}

		
	}
	
	return WidgetConstructor;
	
})();