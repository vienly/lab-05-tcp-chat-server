const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');

var scripts = ['./server.js', './lib/*.js', './test/*.js'];
var binFiles = ['./bin/*'];
var testFiles = ['./test/*.js'];

gulp.task('lint', () => {
  return gulp.src(scripts)
  .pipe(eslint({
    rules: {
      'no-console': 0,
      'indent': [
        2,
        2
      ],
      'quotes': [
        2,
        'single'
      ],
      'linebreak-style': [
        2,
        'unix'
      ],
      'semi': [
        2,
        'always'
      ]
    },
    env: {
      'es6': true,
      'node': true,
      'browser': true
    },
    global: {
      'describe': false,
      'it': false,
      'beforeEach': false,
      'afterEach': false,
      'before': false,
      'after': false
    },
    ecmaFeatures: {
      'modules': true,
      'experimentalObjectRestSpread': true,
      'impliedStrict': true
    },
    extends: 'eslint:recommended'
  }))
  .pipe(eslint.format());
});

gulp.task('test', () => {
  return gulp.src(testFiles)
  .pipe(mocha({reporter: 'spec'}));
});

gulp.task('watch', () => {
  gulp.watch([scripts, testFiles, binFiles], ['lint', 'test']);
});

gulp.task('default', ['watch', 'lint', 'test']);
