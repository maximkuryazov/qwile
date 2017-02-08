(function() {

    const defaultDomain = "http://95.31.9.74";

    const util = require('util');
    const mongoose = require('mongoose');
    const databaseName = "qwile";
    mongoose.connect('mongodb://localhost/' + databaseName);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Connection error:'));

    const crypto = require('crypto');
    const cookieParser = require('cookie-parser');
    const session = require('express-session');

    // Static server

    var static = require('node-static'),
        port = 8080,
        http = require('http');

    var staticServer = new static.Server('./client', {
        cache: 0,
        gzip: true
    });

    http.createServer(function (req, res) {

        var params = req.url.replace(/\/\?/, "").split("=");
        if (req.url == "/desktop") {

            var fs = require('fs');
            fs.readFile('client/index.html', 'utf8', function (error, data) {
                if (error) {
                    return console.log(error);
                }
                res.setHeader('content-type', 'text/html');
                res.end(data);
            });

        } else {

            req.addListener('end', function () {
                staticServer.serve(req, res);
            }).resume();

        }

    }).listen(port, "0.0.0.0");

    console.log('Static server listening on port ' + port + '!');

    // Dynamic server

    var express = require('express');
    var path = require('path');
    var bodyParser = require('body-parser');
    var timeout = require('connect-timeout')

    var app = express();
    app.use(cookieParser());

    app.use(session({
        secret: require('crypto').randomBytes(64).toString('hex'),
        key: 'session.id'
    }));

    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    }));
    app.use(bodyParser.json());         // to support JSON-encoded bodies

    app.set('view engine', 'jade');
    app.set('views', path.join(__dirname, '/client/views'));

    // таймаут может повлиять на заливку файла
    app.use(timeout(12000));

    db.once('open', function () {

        // Start listening server requests only after connection to Mongo established
        console.log('Connected to MongoDB to ' + databaseName + ' database!');

        const User = require("./server/user.js");
        const user = new User(mongoose, db);

        function setCrossDomainHeaders(res, req) {

            // this shit needs to be, 'cuz in the client, jQuery success callback doesn't fire
            // when domain is not specified (http://<domain>:8080) because of cross-domain policy.

            res.set('Access-Control-Allow-Origin', 'http://' + req.get('host').split(":")[0] + ':' + port);
            res.set('Access-Control-Allow-Credentials', true);

        }

        app.all('*', function(req, res, next) {

            console.log(req.url);

            setCrossDomainHeaders(res, req);

            var requestString = '/templateController?template=';
            if (
                req.url == requestString + 'login' ||
                req.url == requestString + 'desktop' ||
                req.url == '/user/login' ||
                /^\/user\/activate/.test(req.url) ||
                req.url == '/mail' || /^\/captcha/.test(req.url) || req.url == '/user/new'
            ) {
                return next();
            } else if (!req.session.email) {

                res.set('Content-Type', 'application/json');
                res.send(JSON.stringify({
                    success: false,
                    error: "You are not logged in."
                }));

            } else {
                user.getByMail(req.session.email, function(document) {
                    if (req.session) req.session.currentUser = document;
                });
                return next();
            }

        });

        // Routing

        app.get("/templateController", function (req, res) {

            console.log("Session: ", req.session.email);
            console.log(req.query.template);

            setCrossDomainHeaders(res, req);

            console.log("Cookie: " + util.inspect(req.cookies, false, null));

            function checkLogin() {
                // you are logged in?
                if (req.session.email) {
                    
                    res.cookie("redirect", "desktop");
                    res.render('desktop');
                    
                } else {
                    
                    res.cookie("redirect", "/");
                    res.render('login');
                    
                }
            }

            switch (req.query.template) {
                case "login":
                    if (req.cookies.remember) {
                        checkLogin();
                     } else {
                        res.cookie("redirect", "/");
                        res.render('login');
                     }
                break;
                case "desktop":
                    checkLogin();
                break;
            }

        });

        app.get("/user/remove", function(req, res) {
            user.remove(req.query.id, function() {
                res.set('Access-Control-Allow-Origin', '*');
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({ success: true }));
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

                            let mail = require("./server/mail.js");

                            var options = {
                                to:         userData.email,
                                from:       "Qwile OS <admin@qwile.com>",
                                subject:    "Qwile: Account was created!",
                                html:       'Your registration had been done. To activate your profile, click on the link below.<br /> \
                                            <a href="' + defaultDomain + ':3000/user/activate?code=' + userData.activationCode
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
                        sendResponse(true, remember, true);

                    } else {
                        sendResponse(false, false, true);
                    }

                }

            });

        });

        // it's for testing mail

        app.get("/mail", function(req, res) {

            res.set('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'application/json');

            let mail = require("./server/mail.js");

            var options = {
                to:         req.query.address,
                from:       "Qwile OS <admin@qwile.com>",
                subject:    req.query.subject,
                text:       req.query.text,
                html:       req.query.html
            };

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

        });

        app.get('/captcha', function (req, res) {

            var svgCaptcha = require('svg-captcha');
            var captcha = svgCaptcha.create();
            res.set('Content-Type', 'image/svg+xml');
            res.cookie("captcha", crypto.createHash('md5').update(captcha.text).digest("hex")).status(200).send(captcha.data);

        });

        app.listen(3000, function () {
            console.log('Dynamic server listening on port 3000!');
        });

    });

})();