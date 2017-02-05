(function() {

    const util = require('util');
    const mongoose = require('mongoose');
    const databaseName = "qwile";
    mongoose.connect('mongodb://localhost/' + databaseName);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Connection error:'));

    const crypto = require('crypto');
    const cookieParser = require('cookie-parser')
    
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

        // Routing

        app.get("/templateController", function (req, res) {

            console.log(req.query.template);
            res.set('Access-Control-Allow-Origin', '*');
            switch (req.query.template) {
                case "login":
                    res.render('login');
                    break;
                case "desktop":
                    // нужно быть залогиненым, чтобы получить десктоп, иначе должен возвращать редирект на вход
                    res.render('desktop');
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

            // this shit needs to be, 'cuz in the client, jQuery success callback doesn't fire
            // when domain is not specified (http://<domain>:8080) because of cross-domain policy.

            console.log("Origin: " + 'http://' + req.get('host').split(":")[0] + ':' + port);

            res.set('Access-Control-Allow-Origin', 'http://' + req.get('host').split(":")[0] + ':' + port);
            res.set('Access-Control-Allow-Credentials', true);

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

                        user.create(userData);

                        let mail = require("./server/mail.js");

                        var options = {
                            to:         userData.email,
                            from:       "Qwile OS <admin@qwile.com>",
                            subject:    "Qwile: Account was created!",
                            html:       "<b>Your registration had been done.</b>"
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

                });

            } else {
                res.send(JSON.stringify({
                    success: false,
                    errors: errors
                }));
            }

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

        app.listen(3000, function () {
            console.log('Dynamic server listening on port 3000!');
        });

    });

})();