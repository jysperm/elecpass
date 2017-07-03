const babel = require('gulp-babel');
const cleanCss = require('gulp-clean-css');
const gulp = require('gulp');
const less = require('gulp-less');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const webpack = require('webpack-stream');

gulp.task('styles', () => {
  return gulp.src('styles/main.less')
    .pipe(less({paths: ['node_modules/bootstrap/less']}))
    .pipe(cleanCss())
    .pipe(rename('bundled.css'))
    .pipe(gulp.dest('public'));
});

gulp.task('components', () => {
  return gulp.src('components/*.jsx')
    .pipe(babel({
      presets: ['es2015'],
      plugins: ['transform-react-jsx']
    }))
    .pipe(gulp.dest('public/components'));
});

gulp.task('app', () => {
  return gulp.src('app/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('public'));
});

gulp.task('bundled', ['app', 'components'], () => {
  return gulp.src('public/app.js')
    .pipe(webpack({
      output: {
        filename: 'app.bundled.js'
      }
    }))
    // .pipe(uglify())
    .pipe(gulp.dest('public'));
});

gulp.task('watch', ['default'], () => {
  gulp.watch(['components/*.jsx', 'app/*.js'], ['bundled']);
  gulp.watch(['styles/*.less'], ['styles']);
});

gulp.task('default', ['bundled', 'styles']);
