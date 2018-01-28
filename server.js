(function() {

    const port = process.argv[2] === "https" ? 443 : process.argv[3] || 80;

    global.protocol = port === 443 ? "https" : "http";
    global.defaultDomain = protocol + "://95.31.9.74";

    const util = require('util');
    const mongoose = require('mongoose');
    const databaseName = "qwile";

    mongoose.connect('mongodb://localhost/' + databaseName);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Connection error: '));

    const crypto = require('crypto');
    const cookieParser = require('cookie-parser');
    const session = require('express-session');
    const fileUpload = require('express-fileupload');
    const http = require('http');
    const https = require('https');
    const favicon = require('express-favicon');
    const fs = require('fs');

    // Static and dynamic server in one

    var express = require('express');
    var path = require('path');
    var bodyParser = require('body-parser');
    var timeout = require('connect-timeout');
    var compression = require('compression');
    var MongoStore = require('connect-mongo')(session);

    var app = express();
    app.use(cookieParser());
    app.use(compression());
    app.use(fileUpload());

    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    }));
    app.use(bodyParser.json());         // to support JSON-encoded bodies
    app.set('view engine', 'jade');
    app.set('views', path.join(__dirname, '/client/'));

    app.use(timeout(12000));
    app.use(function (req, res, next) {

        setTimeout(function () {
            if (req.timedout) {

                res.set('Content-Type', 'application/json');
                res.send(JSON.stringify({

                    success: false,
                    error: "Server timeout error."

                }));

            }
        }, 12000);
        next();

    });
    app.use(express.static('./client'));

    var RewriteMiddleware = require('express-htaccess-middleware');
    var RewriteOptions = {

        file: path.resolve(__dirname, '.htaccess'),
        verbose: (process.env.ENV_NODE == 'development'),
        watch: (process.env.ENV_NODE == 'development')

    };
    app.use(RewriteMiddleware(RewriteOptions));
    app.use(favicon(__dirname + '/img/favicon.ico'));

    db.once('open', function () {

        app.use(session({

            secret: "123456", // crypto.randomBytes(64).toString('hex'),
            key: 'session.id',
            proxy: true,
            resave: true,
            saveUninitialized: true,
            cookie: {
                maxAge: 10000000
            },
            store: new MongoStore({
                db: mongoose.connection.db
            }, function () {
                console.log("DB session connection is open.");
            })

        }));

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

        app.all("*", function(req, res, next) {

            console.log(req.url);

            setCrossDomainHeaders(res, req);

            if (req.url == "/desktop") {
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
            fs.readFile('./client/apps/chat/index.html', "utf-8", function (error, data) {
                res.send(data);
            });
        });

        let WidgetController = require("./server/controller/widget");
        let widgetController = new WidgetController(app, user, mongoose, db);

        app.get("/templateController", function (req, res) {

            console.log("Session: ", req.session.email);
            console.log(req.query.template);

            setCrossDomainHeaders(res, req);

            console.log("Cookie: " + util.inspect(req.cookies, false, null));

            function checkLogin() {
                
                // Are you logged in?
                if (req.session.email) {
                    user.getByMail(req.session.email, function(document) {

                        widgetController.getAllWidgets(req.session.currentUserId, function (widgets) {

                            res.cookie("redirect", "desktop");
                            console.log(document);
                            res.render('views/desktop', {

                                user: document,
                                widgets: widgets

                            });

                        });
                        
                    });
                } else {
                    
                    res.cookie("redirect", "/");
                    res.render('views/login');
                    
                }
            }

            switch (req.query.template) {
                case "login":
                     if (req.cookies.remember) {
                        checkLogin();
                     } else {
                        res.cookie("redirect", "/");
                        res.render('views/login');
                     }
                break;
                case "desktop":
                    checkLogin();
                break;
            }
        });

        let AppController = require("./server/controller/app")(app, mongoose, db);
        let UserController = require("./server/controller/user")(app, user, {

            appsUsersModel: AppController.static.getAppsUsersModel(),
            widgetsUsersModel: WidgetController.static.getWidgetsUsersModel()
            
        });

        app.get('/captcha', function (req, res) {

            var svgCaptcha = require('svg-captcha');
            var captcha = svgCaptcha.create();
            res.set('Content-Type', 'image/svg+xml');
            res.cookie("captcha", crypto.createHash('md5').update(captcha.text).digest("hex")).status(200).send(captcha.data);

        });

        let credentials = {

            key: fs.readFileSync("./ssl/server.key", "utf8"),
            cert: fs.readFileSync("./ssl/server.crt", "utf8"),
            passphrase: "123456"

        };

        function serverRunningCallback () {
            console.log('Dynamic server listening on port ' + port);
        }

        var server;

        if (process.argv[2] == "https") {
            server = https.createServer(credentials, app).listen(port, "0.0.0.0", serverRunningCallback);
        } else {
            server = http.createServer(app).listen(port, "0.0.0.0", serverRunningCallback);
        }

        var io = require('socket.io').listen(server);
        io.on('connection', function (socket) {

            console.log("Socket connected");
            socket.on('ferret', function (name, fn) {
                fn('woot');
            });

        });

    });

})();