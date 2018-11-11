const gulp = require('gulp');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const named = require('vinyl-named');
const webpack = require('webpack-stream');

gulp.task('renderer', () => {
  return gulp.src(['src/renderer/app.js'])
    .pipe(named())
    .pipe(webpack({
      mode: process.env.NODE_ENV || 'development',
      target: 'electron-renderer',
      resolve: {
        extensions: ['.wasm', '.mjs', '.js', '.jsx', '.json', '.less']
      },
      module: {
        rules: [
          {
            test: /\.m?jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
          }, {
            test: /\.less$/,
            loader: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
          }, {
            test: /\.(woff2?|ttf|eot|svg)$/,
            loader: 'url-loader'
          }, {
            test: /\.html$/,
            loader: 'file-loader',
            options: {
              useRelativePath: true,
              name: '[name].[ext]',
            },
          }
        ]
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: "[name].css"
        })
      ]
    }))
    .pipe(gulp.dest('public'));
});

gulp.task('watch', ['default'], () => {
  gulp.watch(['src/**/*.js', 'src/**/*.jsx', 'src/**/*.less', 'src/**/*.html'], ['renderer']);
});

gulp.task('default', ['renderer']);
