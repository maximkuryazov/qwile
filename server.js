(function() {

    const databaseName = "qwile";
    var mongoose = require('mongoose');
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

    const util = require('util');

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

    var app = express();

    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    }));
    app.use(bodyParser.json());         // to support JSON-encoded bodies

    app.set('view engine', 'jade');
    app.set('views', path.join(__dirname, '/client/views'));

    db.once('open', function () {

        // Start listening server requests only after connection to Mongo established
        console.log('Connected to MongoDB to ' + databaseName + ' database!');

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

        app.post("/user/new", function (req, res) {

            res.set('Access-Control-Allow-Origin', '*');
            console.log("User create post params: ", util.inspect(req.body, false, null));

            function inappropriateSymbolsCheck(string) {
                return /\/|\{|\}|\:|<|>|,|\?|!|\s/g.test(string) ? false : string;
            }

            var user = {
                email: inappropriateSymbolsCheck(req.body.email),
                password: inappropriateSymbolsCheck(req.body.password),
                confirmation: inappropriateSymbolsCheck(req.body.confirmation),
                capture: inappropriateSymbolsCheck(req.body.capture)
            };
            var errors = [];

            for (var key in user) {
                if (!user[key]) errors.push(key);
            }

            res.setHeader('Content-Type', 'application/json');
            if (errors.length === 0) {

                var User = require("./server/user.js");
                var user = new User("Maxim", "Kuryazov", mongoose);
                user.remove();
                user.create();

                res.send(JSON.stringify({success: true}));

            } else {
                res.send(JSON.stringify({
                    success: false,
                    errors: errors
                }));
            }

        });

        app.listen(3000, function () {
            console.log('Dynamic server listening on port 3000!');
        });

    });

})();