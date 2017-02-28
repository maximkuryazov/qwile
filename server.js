﻿(function() {

    global.defaultDomain = "http://95.31.9.74";

    const util = require('util');
    const mongoose = require('mongoose');
    const databaseName = "qwile";
    mongoose.connect('mongodb://localhost/' + databaseName);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Connection error:'));

    const crypto = require('crypto');
    const cookieParser = require('cookie-parser');
    const session = require('express-session');
    const fileUpload = require('express-fileupload');

    const port = 80;

    // Static and dynamic server in one

    var express = require('express');
    var path = require('path');
    var bodyParser = require('body-parser');
    var timeout = require('connect-timeout');
    var compression = require('compression');

    var app = express();
    app.use(cookieParser());
    app.use(compression());
    app.use(fileUpload());

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

    // timeout may affect long file uploads
    app.use(timeout(12000));
    app.use(express.static('./client'));

    db.once('open', function () {

        // Start listening server requests only after connection to Mongo established
        console.log('Connected to MongoDB to ' + databaseName + ' database!');

        const User = require("./server/model/user.js");
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

                var requestString = '/templateController?template=';
                if (
                    req.url == requestString + 'login' || req.url == requestString + 'desktop' ||
                    req.url == '/user/login' || req.url == '/user/restore' ||
                    /^\/user\/updatePassword/.test(req.url) || /^\/user\/activate/.test(req.url) ||
                    /^\/user\/changePassword/.test(req.url) || /^\/captcha/.test(req.url) ||
                    req.url == '/user/new' || /\/templateController/.test(req.url)
                ) {
                    return next();
                } 
                else if (!req.session.email) {

                    res.set('Content-Type', 'application/json');
                    res.send(JSON.stringify({
                        
                        success: false,
                        error: "You are not logged in."
                        
                    }));

                } else {
                    user.getByMail(req.session.email, function (document) {
                        if (req.session) req.session.currentUser = document;
                    });
                    return next();
                }

            }

        });

        app.get("/webrtc", function (req, res) {
            var fs = require('fs');
            fs.readFile('./client/apps/chat/index.html', "utf-8", function (error, data) {
                res.send(data);
            });
        });

        app.get("/templateController", function (req, res) {

            console.log("Session: ", req.session.email);
            console.log(req.query.template);

            setCrossDomainHeaders(res, req);

            console.log("Cookie: " + util.inspect(req.cookies, false, null));

            function checkLogin() {
                
                // Are you logged in?
                if (req.session.email) {
                    user.getByMail(req.session.email, function(document) {
                        
                        res.cookie("redirect", "desktop");
                        console.log(document);
                        res.render('desktop', { user: document });
                        
                    });
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
        
        let userController = require("./server/controller/user")(app, user);
        let appController = require("./server/controller/app")(app, user, mongoose, db);

        app.get('/captcha', function (req, res) {

            var svgCaptcha = require('svg-captcha');
            var captcha = svgCaptcha.create();
            res.set('Content-Type', 'image/svg+xml');
            res.cookie("captcha", crypto.createHash('md5').update(captcha.text).digest("hex")).status(200).send(captcha.data);

        });

        app.listen(port, "0.0.0.0", function () {
            console.log('Dynamic server listening on port 80!');
        });

    });

})();