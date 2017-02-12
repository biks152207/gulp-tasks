var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var minify = require('gulp-minify');


var gulp = require('gulp');


// script path
var jsFiles =  'assets/scripts/**/*.js',
      jsDest =  'assets/dist/scripts',
      concatSrc = 'assets/dist/scripts/**/*.js',
      concatDest =  'assets/dist/',
      minifyDest = 'assets/dist/minify';

var files = [
  'assets/scripts/b.js',
  jsFiles
]

gulp.task('annotate', function(){
  return gulp.src(jsFiles)
        .pipe(ngAnnotate())
        .pipe(gulp.dest(jsDest))
})

gulp.task('scripts', function(){
  return gulp.src(concatSrc)
            .pipe(concat('scripts.js'))
            .pipe(gulp.dest(concatDest))
            .pipe(rename('scripts.min.js'))
            .pipe(minify())
            .pipe(uglify())
            .pipe(gulp.dest(concatDest));
})
gulp.task('default', ['annotate', 'scripts'],function(){
  console.log('finished..');
})
