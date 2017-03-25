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

	app.get("/app/get/all", function (req, res) {
		appModel.getAllApps(function (documents, error) {

			console.log("List of return apps:  ", documents);
			if (!error) {
				res.render("views/apps", {
					apps: documents
				});
			} else {

				res.setHeader("Content-Type", "text/plain charset=utf-8");
				res.status(500).send("Error " + error + "occurred.");

			}

		}, req.session.currentUserId);
	});

	app.put('/app/add', function (req, res) {

		console.log("App ID: ", req.body.id);
		res.setHeader("Content-Type", "application/json");
		appModel.add(req.session.currentUserId, req.body.id, function (document, error) {
			if (!error) {

				console.log("Inserted document: ", document);
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

	app.get("/app/render", function (req, res) {

		// TODO: check for req.query.id
		appModel.getAppById(req.query.id, function (document, error) {
			if (!error && document) {
				try {

					res.render("apps/" + document.url);
					res.end();

				} catch (renderError) {
					console.log("error in app/render: ", renderError);
				}
			}
		});

	});

	app.get("/app/rate", function (req, res) {
		appModel.getRelation(req.query.id, req.session.currentUserId, function (error, relation) {
			if (!error) {
				appModel.getAppById(req.query.id, function (document, error) {
					if (!error && document) {

						if (!relation.voted) {
							var calculatedRating = Math.round((Number(document.rating) + Number(req.query.mark)) / 2);
						} else {

							var oldRating = Number(document.rating) * 2 - relation.voted;
							var calculatedRating = Math.round((oldRating + Number(req.query.mark)) / 2);
							
						}
						appModel.set(req.query.id, {
							rating: calculatedRating
						}, function (affected, error) {

							res.setHeader("Content-type", "application/json");
							if (!error)  {
								appModel.setRelationProperty(req.query.id, req.session.currentUserId, {
									voted: Number(req.query.mark)
								}, function (affected) {
									if (affected) {
										res.status(200).send(JSON.stringify({

											success: true,
											rating: calculatedRating

										}));
									}
								});
							} else {
								res.status(200).send(JSON.stringify({

									success: false,
									error: error

								}));
							}

						});

					}
				});
			} else {
				res.status(200).send(JSON.stringify({

					success: false,
					error: error

				}));
			}
		});
	});

};