'use strict'
let fs = require('fs')
let gulp = require('gulp')
let stylus = require('gulp-stylus')
let concat = require('gulp-concat')
let debug = require('gulp-debug')
let sourcemaps = require('gulp-sourcemaps')
let gulpIf = require('gulp-if')
let clean = require('gulp-clean')
let newer = require('gulp-newer')
let bs = require('browser-sync').create()
let notify = require('gulp-notify')
let plumber = require('gulp-plumber') //also possible to use pipe.combiners

const isDevelopment = process.env.NODE_ENV == 'development' || !process.env.NODE_ENV

gulp.task('style', function() {
    return gulp.src('front/**/main.styl')
        .pipe(plumber({errorHandler: notify.onError()}))
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(stylus())
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest('public'))
})

gulp.task('clean', function(callback) {
    if(!fs.existsSync('public'))
        return callback()

    return gulp.src('public', {read: false})
        .pipe(clean())
})

gulp.task('assets', function() {
    return gulp.src('front/assets/**', {since: gulp.lastRun('assets')}) //will be provessing files that were changed from last build
        .pipe(newer('public')) //Pass through newer source files only
        .pipe(debug({title: 'assets'}))
        .pipe(gulp.dest('public'))
})

gulp.task('build', gulp.series(
    'clean',
    gulp.parallel('style', 'assets')
))

gulp.task('watch', function() {
    gulp.watch('front/**/*.*', gulp.series('style'))
    gulp.watch('front/assets/**/*.*', gulp.series('assets'))
})

gulp.task('serve', function() {
    bs.init({
        server: 'public'
    })

    bs.watch('public/**/*.*').on('change', bs.reload)
})

gulp.task('dev', gulp.series(
    'build',
    gulp.parallel('watch', 'serve')
))