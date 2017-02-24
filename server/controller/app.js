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

	app.post("/app/upload", function (req, res) {

		console.log("FILES: ", req.files);
		console.log("ID: ", req.session.currentUserId);

		if (!req.files) {
			return res.status(400).send("No files were uploaded.");
		} else {

			res.setHeader("Content-Type", "application/json");
			let uploadedFile = req.files.upload;
			uploadedFile.mv("./storage/" + req.session.currentUserId + "/" + uploadedFile.name, function(error) {
				if (error) {
					return res.status(500).send(JSON.stringify({

						success: false,
						error: error

					}));
				} else {
					res.status(200).send(JSON.stringify({

						success: true,
						message: "Upload  finished. Your file has been successfully uploaded."

					}));
				}
			});

		}

	});

};