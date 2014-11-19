'use strict';

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    prefix = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    del = require("del"),
    runSequence = require('run-sequence'),
    scsslint = require('gulp-scss-lint'),
    handlebars = require('gulp-compile-handlebars'),
    json = require('jsonfile'),
    browserSync = require('browser-sync');

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: "./build/",
    },
    open: false,
    logConnections: true,
    logSnippet: false
  });
});

gulp.task('clean', function(cb){
  return del([
    'build/**/*'
  ], cb);
});

gulp.task('scss-lint', function() {
  return gulp.src('./src/scss/*.scss')
    .pipe(scsslint({
      'config': '.scss-lint.yml'
    }))
    .pipe(scsslint.failReporter());
});

gulp.task('compile-scss', function(){
  return gulp.src('./src/scss/_wvu-hero.scss')
    .pipe(rename('wvu-hero.scss')) 
    .pipe(sass({
      includePaths: ['scss'],
      outputStyle: 'expanded'
    }))
    .pipe(prefix("last 1 version", "> 1%", "ie 8", "ie 7", { cascade: true }))
    .pipe(gulp.dest('./build/css/'))
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('compile', ['scss-lint','compile-scss'], function () {
  var templateData = json.readFileSync('./src/handlebars/data/_wvu-hero.json');
  var options = {
    batch : [
      './src'
    ]
  }
  return gulp.src('./src/handlebars/test/index.hbs')
        .pipe(handlebars(templateData, options))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('./build'))
        .pipe(browserSync.reload({stream:true}));
});


gulp.task('build',function(){
  runSequence('clean','compile');
});

// Watch Task
gulp.task('watch', function () {
  gulp.watch([
    './src/handlebars/**/*.hbs'
  ],['build']);
  gulp.watch(['./src/handlebars/data/**/*.json'],['build']);
  gulp.watch(['./src/scss/**/*.scss'],['compile-scss']);
});

gulp.task('test',['build']);
gulp.task('ci',['scss-lint']);

// Default Task
gulp.task('default', ['build', 'watch', 'browser-sync']);