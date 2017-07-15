// pretty simple build file for Expression Engine tests
const gulp       = require('gulp');
const typescript = require('gulp-tsc'); 
const tscConfig  = require('./tsconfig.json');
const mocha      = require('gulp-mocha');
const util       = require('gulp-util');
const chai       = require('chai');

// compile the source code and test suite
gulp.task('compile', function () {
    return gulp
    .src([
      'test/parser.specs.ts',
      'src/**/*.ts'
    ], { base: "." })
    .pipe(typescript(tscConfig.compilerOptions))
    .pipe(gulp.dest('.'))
});

gulp.task('test', function () {
  return gulp.src("./test/parser.specs.js", {read:false})
  .pipe(mocha({reporter:'spec'}));
});