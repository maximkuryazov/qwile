(function() {

    const util = require('util');
    const mongoose = require('mongoose');
    const databaseName = "qwile";
    mongoose.connect('mongodb://localhost/' + databaseName);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Connection error:'));
    
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

    console.log('Static server listening on port 8080!');

    // Dynamic server

    var express = require('express');
    var path = require('path');
    var bodyParser = require('body-parser');
    var timeout = require('connect-timeout')

    var app = express();

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

            res.set('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'application/json');

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
                        res.send(JSON.stringify({ success: true }));
                    }
                });

            } else {
                res.send(JSON.stringify({
                    success: false,
                    errors: errors
                }));
            }

        });

        app.get("/mail", function(req, res) {

            res.set('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'application/json');

            const nodeMailer = require('nodemailer');

            var transporter = nodeMailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'maximkuryazov@gmail.com',
                    pass: '322538631'
                }
            });

            var mailOptions = {
                to:         req.query.address,
                subject:    req.query.subject,
                text:       req.query.text,
                html:       req.query.html
            };

            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error);
                    res.send({ success: false });
                } else{
                    console.log("Message sent: " + info.message);
                    res.send({ success: true });
                }
            });

        });

        app.listen(3000, function () {
            console.log('Dynamic server listening on port 3000!');
        });

    });

})();