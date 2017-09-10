const babel = require('gulp-babel');
const gulp = require('gulp');
const less = require('gulp-less');
const rename = require('gulp-rename');

gulp.task('styles', () => {
  return gulp.src('styles/main.less')
    .pipe(less({paths: ['node_modules/bootstrap/less']}))
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

gulp.task('watch', ['default'], () => {
  gulp.watch(['app/*.js'], ['app']);
  gulp.watch(['components/*.jsx'], ['components']);
  gulp.watch(['styles/*.less'], ['styles']);
});

gulp.task('default', ['app', 'components', 'styles']);
