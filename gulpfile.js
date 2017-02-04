const gulp          = require('gulp');
const autoprefixer  = require('gulp-autoprefixer');
const concat        = require('gulp-concat-css');
const minifyCSS     = require('gulp-minify-css');

gulp.task('css', function() {

    console.log('CSS task running...');

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

    console.log('CSS task over.');

});