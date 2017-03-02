/* File: gulpfile.js */
var gulp = require('gulp');

var gutil = require('gulp-util');

var minifyCSS = require('gulp-minify-css');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var htmlreplace = require('gulp-html-replace');

var ghPages = require('gulp-gh-pages');

gulp.task('copy', function() {
  gutil.log('Gulp is copy resources!');
  gulp.src([
    '*fonts/**/*'//,
    //'*img/**/*'
  ])
  .pipe(gulp.dest('build/'));
});

gulp.task('minifyCSS', function () {
    gutil.log('Gulp is minify CSS!');
    gulp.src('./css/*.css')
        .pipe(minifyCSS({keepSpecialComments: 0}))
        .pipe(concat('styles.min.css'))
        .pipe(gulp.dest('./build/css/'));
});

gulp.task('minifyJS', function () {
    gutil.log('Gulp is minify JS!');
    gulp.src(['./js/jquery-3.1.1.min.js','./js/underscore-min.js','./js/backbone-min.js','./js/app.js'])
        /*.pipe(uglify({
            compress: {
                drop_console: true
            }
        }))        
    */
        .pipe(concat('main.min.js'))
        .pipe(gulp.dest('./build/js/'));
});
 
gulp.task('replace', function() {
    gutil.log('Gulp is replace paths!');
    gulp.src('index.html')
        .pipe(htmlreplace({
            'css': './css/styles.min.css',
            'js': './js/main.min.js'
        }))
        .pipe(gulp.dest('build/'));
});

gulp.task('deploy', function() {    
    gutil.log('Gulp is copy to gh-page!');
    return gulp.src('./build/**/*')
        .pipe(ghPages());
});

// create a default task and just log a message
gulp.task('default',['copy', 'minifyCSS', 'minifyJS', 'replace', 'deploy'], function() {  
    gutil.log('Gulp is running!');
});