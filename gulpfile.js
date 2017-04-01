const gulp          = require('gulp');
const autoprefixer  = require('gulp-autoprefixer');
const concat        = require('gulp-concat-css');
const minifyCSS     = require('gulp-minify-css');
const uglify        = require('gulp-uglify');
const pump          = require('pump');
const imagemin      = require('gulp-imagemin');
const browserSync   = require('browser-sync').create();
const stripDebug    = require('gulp-strip-debug');
const jshint        = require('gulp-jshint');

gulp.task('default', function(callback) {

        console.log('CSS compress is running...');

        let autoprefixerOptions = {
            browsers: ['last 2 versions', 'safari 5', 'ie 7', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
            cascade: false
        };

        gulp.src(['client/css/lib/bootstrap.min.css', 'client/css/lib/bubbles.css', 'client/css/login.css'])
            .pipe(minifyCSS())
            .pipe(autoprefixer(autoprefixerOptions))
            .pipe(concat('login.min.css'))
            .pipe(gulp.dest('dist/css'));

        gulp.src([
            'client/css/lib/bootstrap.buttons.min.css',
            'client/css/lib/resizable.css',
            'client/css/widget/clock.css',
            'client/css/widget/calc.css',
            'client/css/lib/tipped.css',
            'client/css/desktop.css'
        ])
            .pipe(minifyCSS())
            .pipe(autoprefixer(autoprefixerOptions))
            .pipe(concat('desktop.min.css'))
            .pipe(gulp.dest('dist/css'));

        console.log('CSS compress is over.');

        console.log('Compress JS is running...');
        pump([

                // desktop js files

                gulp.src(['client/js/*.js']),
                stripDebug(),
                uglify(),
                gulp.dest('dist/js'),

                // widgets js files

                gulp.src(['client/js/widget/*.js']),
                stripDebug(),
                uglify(),
                gulp.dest('dist/js/widget')

            ], callback
        );
        console.log('Compress JS is done.');

});

gulp.task("image", function () {

    gulp.src('client/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'));

});

gulp.task("lint", function() {
    return gulp.src(["./client/*.js", "./server/*.js"])
        .pipe(jshint())
        .pipe(jshint.reporter("jshint-stylish"));
});

// NOTE: Browser reloading doesn't work with nodemon activated!
// only when server started as $ node server.js ?[https 443]

gulp.task("reload", function (done) {

    browserSync.reload();
    done();

});

gulp.task("watch", function () {

    browserSync.init({

        proxy: "https://localhost",
        port: 80,
        open: true

    });
    gulp.watch(["client/js/*.js", "client/view/*.jade", "client/styl/*.styl"], ["reload"]);

});

// deploy

gulp.task('deploy', function() {
    console.log("It should rename dist folder to client, and client folder to client-dev.");
});