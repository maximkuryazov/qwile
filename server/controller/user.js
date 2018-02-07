/**
 * Created by User on 2/20/2017.
 */

module.exports = function (app, user, models) {

	const util = require('util');
	const crypto = require('crypto');
	const cookieParser = require('cookie-parser');
	const session = require('express-session');
	const Jimp = require('jimp');
	const port = 80;

	function setCrossDomainHeaders(res, req) {

		res.set('Access-Control-Allow-Origin', 'http://' + req.get('host').split(":")[0] + ':' + port);
		res.set('Access-Control-Allow-Credentials', true);

	}

	app.delete("/user", function (req, res) {

		var id = req.session.currentUserId;
		user.remove(id, function(error) {

			res.set("Access-Control-Allow-Origin", "*");
			res.setHeader("Content-Type", "application/json");

			function sendError () {
				res.send(JSON.stringify({

					success: false,
					error: error

				}));
			}

			if (!error) {
				models.appsUsersModel.remove({ "user": id }, function (error) {
					if (!error) {
						models.widgetsUsersModel.remove({ "user": id }, function (error) {
							if (!error) {
								req.session.destroy(function(error) {
									if (!error) {
										res.send(JSON.stringify({
											success: true
										}));
									} else sendError(error);
								});
							} else sendError(error);
						});
					} else sendError(error);
				});
			} else sendError(error);

		});

	});

	app.get("/user/settings/sound", function (req, res) {

		res.set("Content-Type", "application/json");
		if (req.query.set) {
			
			user.setSetting(req.session.currentUserId, { sound: req.query.set }, function (updated) {
				if (updated) {
					res.send({
						success: true
					});
				} else {
					res.send({
						success: false
					});
				}
			});
			
		} else {
			user.getSetting(req.session.currentUserId, "sound", function (value) {
				res.send({
					sound: value
				});
			});
		}

		// just for settings test
		user.getById(req.session.currentUserId, new Function);
		
	});

	app.post("/user/new", function (req, res) {

		setCrossDomainHeaders(res, req);
		res.set("Content-Type", "application/json");

		console.log("Cookie: " + util.inspect(req.cookies, false, null));
		console.log("User create post params: ", util.inspect(req.body, false, null));

		function inappropriateSymbolsCheck(string) {
			return /\/|\{|\}|\:|<|>|,|\?|!|\s/g.test(string) ? false : string;
		}

		var userData = {

			email:          inappropriateSymbolsCheck(req.body.email),
			password:       inappropriateSymbolsCheck(req.body.password),
			confirmation:   inappropriateSymbolsCheck(req.body.confirmation),
			capture:        inappropriateSymbolsCheck(req.body.capture)

		};
		var errors = [];

		for (var key in userData) {
			if (!userData[key]) errors.push(key);
		}

		if (errors.length === 0) {

			user.getByMail(userData.email, function(doc) {

				if (doc) {

					console.log("This email is already occupied.");
					res.send(JSON.stringify({

						success: false,
						occupied: true,
						errors: []

					}));

				} else {

					if (req.cookies.captcha !== crypto.createHash('md5').update(userData.capture).digest("hex")) {
						res.send(JSON.stringify({

							success: false,
							wrongCaptcha: true,
							errors: []

						}));
					} else {

						userData.activationCode = Math.round((Math.random() * 100000));
						user.create(userData);

						let mail = require("../mail.js");
						let fs = require("fs");

                        var options = {
                            to:         userData.email,
                            from:       "Qwile OS <admin@qwile.com>",
                            subject:    "Qwile: Account was created!",
                            html:		fs.readFileSync('client/letters/verify.html', 'utf8')
										.replace(/#\{code\}/, userData.activationCode)
										.replace(/#\{email\}/, userData.email)
										.replace(/#\{domain\}/, defaultDomain)
                        };

						mail.send(options, function (info) {
							res.send(JSON.stringify({

								success: true,
								info: info

							}));
						}, function (error) {
							res.send(JSON.stringify({

								success: false,
								error: error

							}));
						});

					}

				}

			});

		} else {
			res.send(JSON.stringify({

				success: false,
				errors: errors

			}));
		}

	});

	app.get("/user/activate", function(req, res) {

		user.getByMail(req.query.mail, function(document) {
			console.log(util.inspect(document, false, null));
			if (req.query.code == document.activationCode) {
				user.set(document._id, {

					activated: true,
					activationCode: 0

				}, function() {

					res.setHeader("Content-type", "text/html; charset=utf-8");
                    res.render("views/welcome", {
						// domain: defaultDomain
					});

				});
			} else {
				res.render("views/invalidActivation");
			}
		});

	});

	app.get("/user/logout", function(req, res) {

		setCrossDomainHeaders(res, req);
		user.set(req.session.currentUserId, { online: false }, function () {

			res.set('Content-Type', 'application/json');
			req.session.destroy();
			console.log("Logout. Session was destroyed");
			res.send(JSON.stringify({ success: true }));

		});

	});

	app.post("/user/login", function(req, res) {

		setCrossDomainHeaders(res, req);
		res.set('Content-Type', 'application/json');

		user.getByMail(req.body.email, function(document) {

			console.log(util.inspect(document, false, null));

			function sendResponse(success, remember, activated) {
				res.send(JSON.stringify({

					success: success,
					remember: remember,
					activated: activated

				}));
			}

			if (!document) {
				sendResponse(false, false, true);
			} else if (!document.activated) {
				sendResponse(false, false, false);
			} else {

				var cipherPassword = crypto.createHash('md5').update(req.body.password).digest("hex");
				if (document.password === cipherPassword) {
					user.set(document._id, { online: true }, function () {

						var remember = false;
						if (req.body.remember) {

							res.cookie("remember", '{ "email": "' + req.body.email + '", "password": "' + cipherPassword + '" }');
							remember = true;

						}
						req.session.email = req.body.email;
						req.session.currentUserId = document._id;
						sendResponse(true, remember, true);

					});
				} else {
					sendResponse(false, false, true);
				}

			}

		});

	});

	app.post("/user/restore", function(req, res) {

		res.setHeader('Content-Type', 'application/json');
		setCrossDomainHeaders(res, req);

		user.getByMail(req.body.email, function(document) {

			if (!document) {
				res.send({

					success: false,
					error: "There is no such E-Mail in system."

				});
			} else {

				var restoreCode = Math.round((Math.random() * 100000));
				let mail = require("../mail.js");
                let fs = require("fs");

				var options = {

					to:         req.body.email,
					from:       "Qwile OS <admin@qwile.com>",
					subject:    "Qwile: Account restore request",
                    html:		fs.readFileSync('client/letters/restore.html', 'utf8')
								.replace(/#\{code\}/, restoreCode)
								.replace(/#\{email\}/, req.body.email)
								.replace(/#\{domain\}/, defaultDomain)

                };

				user.set(document._id, { restoreCode: restoreCode }, function(info, error) {
					if (!error) {
						mail.send(options, function (info) {
							res.send({

								success: true,
								info: info

							});
						}, function (error) {
							res.send({

								success: false,
								error: error

							});
						});
					}
				});

			}
		});

	});

	app.get("/user/changePassword", function (req, res) {

		res.setHeader("Content-type", "text/html; charset=utf-8");
		user.getByMail(req.query.email, function(document) {
			if (!document) {
				res.render("views/invalidRestoreLink");
			} else if (document.restoreCode == req.query.code && document.email == req.query.email) {
				res.render("views/setNewPassword", {
					domain: defaultDomain
				});
			} else {
				res.render("views/invalidRestoreLink");
			}
		});

	});

	app.post("/user/updatePassword", function (req, res) {

		//  TODO: Check password for inappropriate symbols

		res.setHeader("Content-Type", "application/json");
		setCrossDomainHeaders(res, req);
		user.getByMail(req.body.email, function (document) {
			if (!document) {
				res.send({

					success: false,
					error: "There is no such E-Mail in system."

				});
			} else if (req.body.code == document.restoreCode && req.body.email == document.email) {
				user.set(document._id, {

					restoreCode: 0,
					password: crypto.createHash('md5').update(req.body.password).digest("hex")

				}, function(info, error) {
					if (!error) {
						res.send({
							success: true
						});
					} else {
						res.send({

							success: false,
							error: error

						});
					}
				});
			} else {
				res.send({

					success: false,
					error: "Sometheng wrong. Incorrect data was sent."

				});
			}
		});

	});

	app.post("/user/set", function (req, res) {

		res.setHeader("Content-Type", "application/json");

		if (req.body.field == "email") {
			res.send({

				success: false,
				error: "You can not change mail from here."

			});
		}

		var options = {};
		options[req.body.field] = req.body.value;
		user.set(req.session.currentUserId, options, function (affected, error) {
			if (!error) {

				console.log("Affected rows: ", affected);
				res.send({
					success: true
				});

			} else {
				res.send({

					success: false,
					error: error

				});
			}
		});

	});
	
	app.post("/user/uploadPhoto", function (req, res) {

		console.log("FILES: ", req.files);
		console.log("ID: ", req.session.currentUserId);

		if (!req.files) {
			return res.status(400).send("No files were uploaded.");
		} else {

			var uploadedFile = req.files.uploadedFile;
			var format = uploadedFile.name.replace(/(.*)(\.)(.*)$/, "$3").toLowerCase(); console.log(format);

			if (format != "jpeg" && format != "jpg" && format != "png" && format != "gif") {
				return res.status(500).send(JSON.stringify({

					success: false,
					error: "You may upload only images."

				}));
			}
			console.log("Size: ", req.headers["content-length"] +  " bytes");

			if (req.headers["content-length"] > 2062336) {	// 1mb
				return res.status(400).send("Your file is too big.");
			} else {

				var newImagePath = "./storage/" + req.session.currentUserId + "/__profile/";
				var newImageName = "_currentPhoto.";

				uploadedFile.mv(newImagePath + newImageName + format, function (error) {
					if (error) {
						return res.status(500).send(JSON.stringify({

							success: false,
							error: error

						}));
					} else {

						Jimp.read(newImagePath + newImageName + format, function (error, image) {

							if (error) throw error;
							function saveResizedImage (width, path) {
								image.resize(width, Jimp.AUTO).quality(100).write(path + "jpg");
							}
							saveResizedImage(220, newImagePath + newImageName);
							saveResizedImage(50, newImagePath + newImageName + "min.");
							return res.status(200).send(JSON.stringify({

								success: true,
								message: "Upload  finished. Your file has been successfully uploaded."

							}));

						});

					}
				});

			}
		}
		
	});

	app.get("/user/getPhoto", function (req, res) {
		user.getPhoto("_currentPhoto.jpg", req.session.currentUserId, function (data) {

			res.setHeader("Content-type", "image/jpeg");
			res.end(data);
			
		});
	});

	app.get("/user/getPhotoIcon", function (req, res) {
		user.getPhoto("_currentPhoto.min.jpg", req.session.currentUserId, function (data) {

			res.setHeader("Content-type", "image/jpeg");
			res.end(data);

		});
	});

};