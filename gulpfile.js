const gulp          = require('gulp');
const autoprefixer  = require('gulp-autoprefixer');
const concat        = require('gulp-concat-css');
const minifyCSS     = require('gulp-minify-css');
const uglify        = require('gulp-uglify');
const pump          = require('pump');

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
                uglify(),
                gulp.dest('dist/js'),

                // widgets js files

                gulp.src(['client/js/widget/*.js']),
                uglify(),
                gulp.dest('dist/js/widget')

            ], callback
        );
        console.log('Compress JS is done.');

});

gulp.task('deploy', function() {
    console.log("It should rename dist folder to client, and client folder to client.dev.");
});