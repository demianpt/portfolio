// DEPENDENCIES ================================================================
var browserSync  = require('browser-sync'),
    del          = require('del'),
    fs           = require('fs'),
    gulp         = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    concat       = require('gulp-concat'),
    imagemin     = require('gulp-imagemin'),
    // svgo         = require('imagemin-svgo'),
    cssnano      = require('gulp-cssnano'),
    combineMq    = require('gulp-combine-mq'),
    plumber      = require('gulp-plumber'),
    rename       = require('gulp-rename'),
    replace      = require('gulp-replace'),
    rsync        = require('gulp-rsync'),
    sass         = require('gulp-sass'),
    sourcemaps   = require('gulp-sourcemaps'),
    twig         = require('gulp-twig'),
    uglify       = require('gulp-uglify'),
    gutil        = require('gulp-util'),
    yaml         = require('gulp-yaml'),
    zip          = require('gulp-zip'),
    runSequence  = require('run-sequence'),
    timestamp    = new Date().getTime();


// MESSAGE =====================================================================
function notify(message, emoticon) {
  switch (emoticon) {
    case 'common':
    emoticon = '(｀◕‸◕´+)';
    break;
    case 'start':
    emoticon = '໒( ᓀ ‸ ᓂ )७';
    break;
    case 'yeah':
    emoticon = '＼（＠￣∇￣＠）／';
    break;
    case 'crazy':
    emoticon = '╭(๑¯д¯๑)╮';
    break;
    case 'fuck':
    emoticon = '凸(⊙▂⊙✖)';
    break;
    case 'writing':
    case undefined:
    emoticon = '(๑ò︵ò๑)';
    break;
  }
  gutil.log(emoticon +' '+ message);
};

var throwError = function (err) {
  var fileName     = gutil.colors.gray('\'') + gutil.colors.cyan('Error') +gutil.colors.gray('\''),
  errorMessage = gutil.colors.red('Error compiling. '+ err +' (╯°□°）╯︵ ┻━┻');

  gutil.log(fileName, errorMessage);
};


// PATHS =======================================================================
var path = {
  tmp: '.tmp',
  src: {
    base: 'src',
    data: 'src/data',
    scss: 'src/assets/scss',
    fonts: 'src/assets/fonts',
    image: 'src/assets/images',
    javascript: 'src/assets/javascripts',
  },
  dest: {
    base: 'dist',
    release: 'release',
    scss: 'dist/assets/stylesheets',
    javascript: 'dist/assets/javascripts',
    fonts: 'dist/assets/fonts',
    image: 'dist/assets/images'
  }
};

var AUTOPREFIXER_ARGS = {
  browsers : [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ],
  cascade : true
};

// CSS =========================================================================
gulp.task('scss', function () {
  notify('Compiling Scss');
  return gulp.src(path.src.scss +'/**/*.scss')
  .pipe(plumber(function(error) {
    notify(error.message, 'fuck');
    this.emit('end');
  }))
  .pipe(sourcemaps.init())
  .pipe(sass({
    sourceComments: 'map',
    imagePath: path.src.image
  }))
  .pipe(replace(/\{\*timestamp\*\}/g, timestamp))
  .pipe(combineMq({ beautify: true }))
  .pipe(autoprefixer(), AUTOPREFIXER_ARGS)
  .pipe(cssnano({ zindex: false }))
  .pipe(rename({ suffix:'.min' }))
  .pipe(sourcemaps.write('.', { includeContent : false }))
  .pipe(plumber.stop())
  .pipe(gulp.dest(path.dest.scss))
  .pipe(browserSync.reload({stream:true}));
});


// DATA FOR TWIG ===============================================================
gulp.task('concat:json', function() {
  return gulp.src([
    path.src.data + '/*.yml',
    path.src.data +'/*.yml',
    '!' + path.src.data +'/data.yml'
  ])
  .pipe(plumber({ errorHandler: throwError }))
  .pipe(concat('data.yml'))
  .pipe(gulp.dest(path.src.data))
  .pipe(yaml())
  .pipe(gulp.dest(path.src.data));
});


// TWIG ========================================================================
gulp.task('markup', ['concat:json'], function () {
  if (!fs.existsSync(path.src.data +'/data.json')) {
    throwError();
    return true;
  }
  var json_data = fs.readFileSync(path.src.data +'/data.json', 'utf-8');
  json_data = JSON.parse(json_data.toString());

  return gulp.src([
    path.src.base +'/web/*.twig',
    '!'+ path.src.base +'/web/_*.twig'
  ])
  .pipe(twig({
    data: json_data,
    cache: false
  }))
  .pipe(replace(/\{\*timestamp\*\}/g, timestamp))
  .pipe(gulp.dest(path.dest.base))
  .pipe(browserSync.reload({stream:true}));
});


// JS ==========================================================================
gulp.task('javascripts', [
  'concat:scripts'
]);

gulp.task('concat:scripts', function() {
  return gulp.src([
    path.src.javascript +'/x-parallax.min.js',
    path.src.javascript +'/scripts.js'
  ])
  .pipe(uglify())
  .pipe(concat('scripts.js', { newLine: ';' }))
  .pipe(gulp.dest(path.dest.javascript));
});

// IMAGES ======================================================================
gulp.task('imagemin', function() {
  return gulp.src([
    path.src.image +'/**/*',
    '!' + path.src.image +'/_*',
    '!' + path.src.image +'/**/*.svg'
  ])
  .pipe(imagemin({
      optimizationLevel: 5,
      progressive: true,
      interlaced: true
  }))
//   .pipe(imagemin([
//     imagemin.jpegtran({
//       progressive: true,
//       optimizationLevel: 5
//     }),
//     imagemin.optipng({
//       optimizationLevel: 5
//     }),
//     imagemin.svgo({
//       plugins: [
//         {removeDimensions: true},
//         {removeComments: true},
//         {removeEmptyAttrs: true},
//       ]
//     })
//   ]
// ))
.pipe(gulp.dest(path.dest.image));
});

gulp.task('images', [
  'imagemin'
]);

// FONTS ======================================================================
gulp.task('fonts', function() {
  return gulp.src(path.src.fonts +'/**/*')
  .pipe(gulp.dest(path.dest.fonts));
});

// CLEAN =======================================================================
gulp.task('clean:dist', function () {
  return del(path.dest.base +'/**/*', function (err, deletedFiles) {
    notify('Delete destination folder', 'crazy');
  });
});

// WATCH =======================================================================
gulp.task('watch', ['browserSync'], function() {
  gulp.watch(path.src.scss +'/**/*.scss',     ['scss']);
  gulp.watch(path.src.data +'/*.yml',         ['markup']);
  gulp.watch(path.src.image +'/**/*',         ['images']);
  gulp.watch(path.src.base +'/**/*.twig',     ['markup']);
  gulp.watch(path.src.javascript +'/**/*',    ['javascripts']);
});

// BROWSER SYNC ================================================================
gulp.task('browserSync', ['build'], function() {
  browserSync({
    server: {
      baseDir: 'dist/'
    },
    options: {
      reloadDelay: 250
    },
    notify: false
  });
});


// BUILD =======================================================================
gulp.task('build', function(callback) {
  runSequence(
    'clean:dist',
    'images',
    'scss',
    'fonts',
    'markup',
    'javascripts',
    callback
  );
});

// DEFAULT TASK ================================================================
gulp.task('default', ['watch']);
