/**
 * Created by User on 2/20/2017.
 */

module.exports = function (app, user) {

	const util = require('util');
	const crypto = require('crypto');
	const cookieParser = require('cookie-parser');
	const session = require('express-session');
	const port = 80;

	function setCrossDomainHeaders(res, req) {

		res.set('Access-Control-Allow-Origin', 'http://' + req.get('host').split(":")[0] + ':' + port);
		res.set('Access-Control-Allow-Credentials', true);

	}

	app.get("/user/remove", function (req, res) {
		user.remove(req.query.id, function(error) {

			res.set('Access-Control-Allow-Origin', '*');
			res.setHeader('Content-Type', 'application/json');
			if (!error) {
				res.send(JSON.stringify({
					success: true
				}));
			} else {
				res.send(JSON.stringify({

					success: false,
					error: error

				}));
			}

		});
	});

	app.post("/user/new", function (req, res) {

		setCrossDomainHeaders(res, req);
		res.set('Content-Type', 'application/json');

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

						var options = {
							to:         userData.email,
							from:       "Qwile OS <admin@qwile.com>",
							subject:    "Qwile: Account was created!",
							html:       'Your registration had been done. To activate your profile, click on the link below.<br /> \
                                            <a href="' + defaultDomain + '/user/activate?code=' + userData.activationCode
							+ '&mail=' + userData.email + '">Activate your profile</a>'
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
					res.render("activationComplete", {
						domain: defaultDomain
					});

				});
			} else {
				res.render("invalidActivation");
			}
		});

	});

	app.get("/user/logout", function(req, res) {

		setCrossDomainHeaders(res, req);
		res.set('Content-Type', 'application/json');
		req.session.destroy();
		console.log("Logout. Session was destroyed");
		res.send(JSON.stringify({ success: true }));

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

					var remember = false;
					if (req.body.remember) {

						res.cookie("remember", '{ "email": "' + req.body.email + '", "password": "' + cipherPassword + '" }');
						remember = true;

					}
					req.session.email = req.body.email;
					req.session.currentUserId = document._id;
					sendResponse(true, remember, true);

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
				var options = {
					to:         req.body.email,
					from:       "Qwile OS <admin@qwile.com>",
					subject:    "Qwile: Account restore",
					html:       'To restore your account, please, follow this link: <br /><a href="http://95.31.9.74/user/changePassword?code='
					+ restoreCode + '&email=' + req.body.email +'">Restore your password</a>'
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
				res.render("invalidRestoreLink");
			} else if (document.restoreCode == req.query.code && document.email == req.query.email) {
				res.render("setNewPassword", {
					domain: defaultDomain
				});
			} else {
				res.render("invalidRestoreLink");
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
			var format = uploadedFile.name.split(".")[1].toLowerCase();

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
				uploadedFile.mv("./storage/" + req.session.currentUserId + "/__profile/" + "_currentPhoto." + format, function (error) {
					if (error) {
						return res.status(500).send(JSON.stringify({

							success: false,
							error: error

						}));
					} else {
						return res.status(200).send(JSON.stringify({

							success: true,
							message: "Upload  finished. Your file has been successfully uploaded."

						}));
					}
				});
			}
		}
		
	});

	app.get("/user/getPhoto", function (req, res) {

		var fs = require("fs");
		fs.readFile("storage/" + req.session.currentUserId + "/__profile/_currentPhoto.jpg", function (error, data) {

			if (error) {
				return console.log(error);
			}
			console.log(data);
			res.setHeader("Content-type", "image/jpeg");
			res.end(data);

		});

	});

};