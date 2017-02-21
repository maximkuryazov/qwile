/**
 * Created by User on 2/21/2017.
 */

module.exports = function (app, user, mongoose, db) {
	
	var AppModel = require("../model/app");
	var appModel = new AppModel(mongoose, db);

	app.get("/app/get", function (req, res) {
		appModel.getAppById(req.query.id, function (document, error) {

			res.setHeader("Content-Type", "application/json");
			if (!error) {
				res.send(JSON.stringify({

					success: true,
					data: document

				}));
			} else {
				res.send(JSON.stringify({

					success: false,
					data: {},
					error: error

				}));
			}

		});
	});

}