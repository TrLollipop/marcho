import gulp from 'gulp';
import gScss from 'gulp-sass';
import * as gDart from 'sass';
import gConcat from 'gulp-concat';
import gAutoPre from 'gulp-autoprefixer';
import gUglify from 'gulp-uglify';
import gBrowserSync from 'browser-sync';
import gImagemin from 'gulp-imagemin';
import gDel from 'del';

const scss = gScss(gDart);
const { src, dest, watch, parallel, series } = gulp;
const concat = gConcat;
const autoprefixer = gAutoPre;
const uglify = gUglify;
const browserSync = gBrowserSync.create();
const imagemin = gImagemin;
const del = gDel;

function syncBrowser() {
  browserSync.init({
    server: {
      baseDir: 'app/',
    },
    notify: false,
  });
}

function images() {
  return src('app/images/**/*.*')
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false },
        ]
      })
    ]))
    .pipe(dest('dist/images'));
}

function styles() {
  return src([
    'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.css',
    'app/scss/style.scss',
  ])
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserlist: ['last 10 verisons'],
    }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
}

function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/slick-carousel/slick/slick.js',
    'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
    'app/js/main.js'
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
}

function build() {
  return src([
    'app/**/*.html',
    'app/css/style.min.css',
    'app/js/main.min.js',
  ], { base: 'app' })
    .pipe(dest('dist'));
}

function clean() {
  return del('dist');
}

function watching() {
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/**/*.html']).on('change', browserSync.reload)
}

export const myStyle = styles;
export const myScript = scripts;
export const mySync = syncBrowser;
export const myWatch = watching;
export const myImage = images;
export const myDel = clean;
export const myBuild = series(clean, images, build);

export default parallel(styles, scripts, syncBrowser, watching);