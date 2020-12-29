
  const { src, dest, watch, series, parallel } = require('gulp')
  const sass = require('gulp-sass');
  const connect = require('gulp-connect-php');

  const useref = require('gulp-useref');              // concatenates any number of CSS and JavaScript files into a single file 
  const uglify = require('gulp-uglify');              // help with minifying JavaScript files                    
  const gulpIf = require('gulp-if');                  // to ensure that we only attempt to minify JavaScript files
  const cssnano = require('gulp-cssnano');            //  help with minifying css files 

  const imagemin = require('gulp-imagemin');          //optimizing images
  const cache = require('gulp-cache');                //Optimizing images however, is an extremely slow process that you’d not want to repeat unless necessary

  const del = require('del');                         //files that are no longer used don’t remain anywhere without us knowing

  // const runSequence = require('run-sequence');
  const browserSync = require('browser-sync').create();



var styleWatchFiles = 'app/scss/*.scss';      // Gets all files ending with .scss in app/scss

async function nodeSass() {
  return await src(styleWatchFiles)           
  .pipe(sass().on('error', sass.logError))    // Converts Sass to CSS with gulp-sass
  .pipe(gulp.dest('app/css'))
  .pipe(browserSync.reload({
      stream: true
  }))
};

// concatinate and minified the js scripts file using 'useref' and 'uglify' plugin
async function optimizeProdFiles(){
  return await src('app/*.php')
  .pipe(useref())
  // Minifies only if it's a JavaScript file using 'gulpIf plugin'
  .pipe(gulpIf('*.js', uglify()))
  // Minifies only if it's a CSS file using 'cssnano' plugin
  .pipe(gulpIf('*.css', cssnano()))
  .pipe(gulp.dest('dist'))
};

// optimizing images
async function optimizeImages(){
  return await src('app/img/**/*.+(png|jpg|jpeg|gif|svg)')
  .pipe(cache(imagemin({
      interlaced: true
  })))
  .pipe(gulp.dest('dist/images'))
};

// copying fonts to dist
async function fonts(){
  return await src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
}

// Cleaning up dist folder 
async function cleanDist(){
  return await del.sync('dist/**/*');
}

// browser relaod with browserSync using .php file extension
function browserReload(){
  connect.server({ base: './app', port: 8080, keeplive: true}, function(){
      browserSync.init({
          proxy: '127.0.0.1:8080',
          port: 3200,
          open: true,
          notify: false
      });
  })
  watch(styleWatchFiles, series(nodeSass));   //checks to see if a file was saved.
  watch('app/*.php').on('change', browserSync.reload)
  watch('app/js/**/*.js').on('change', browserSync.reload)
}

exports.build = series(cleanDist, parallel(optimizeProdFiles, optimizeImages, fonts, nodeSass));    // buld  =  combine everything together
exports.default = series(browserReload);



/* note:: async ===  a function always returns a promise
          awaits === makes JavaScript wait until that promise settles and returns its result.
          */