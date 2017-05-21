var gulp        = require('gulp'),
    sass        = require('gulp-sass'),
    browserSync = require('browser-sync'),
    concat      = require('gulp-concat'),
    uglify      = require('gulp-uglifyjs'),
    babel       = require('gulp-babel'),
    cssnano     = require('gulp-cssnano'),
    rename      = require('gulp-rename'),
    del         = require('del'),
    imagemin    = require('gulp-imagemin'),
    pngquant    = require('imagemin-pngquant'),
    cache        = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer');


//scss > css
gulp.task('sass', function () {
    return gulp.src([
        'app/sass/*.scss',
        'app/sass/*.sass',
        '!app/sass/_misc',
        '!app/sass/section'
    ])
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

//css-libs
gulp.task('css-libs', ['sass'], function () {
   return gulp.src('app/css/main.css')
       .pipe(cssnano())
       .pipe(rename({suffix: '.min'}))
       .pipe(gulp.dest('app/css'))
});

//js
gulp.task('js', function () {
    return gulp.src([
        'app/libs/jquery/dist/jquery.min.js'
    ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/js'));
});

//babel
gulp.task('babel', function () {
    return gulp.src('app/js/common.js')
        .pipe(babel())
        .pipe(gulp.dest('app/js/ECMA5'));
});

gulp.task('browser', function () {
   browserSync({
       server: {
           baseDir: 'app'
       },
       notify: false
   });
});


gulp.task('watch', ['browser', 'css-libs', 'js'], function () {
    gulp.watch('app/sass/**/*.scss', ['sass']);
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);
});

//Удаление папки dist
gulp.task('clean', function () {
   return del.sync('dist')
});

//img
gulp.task('img', function () {
    return gulp.src('app/img/**/*') // Берем все изображения из app
        .pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

//Продакшен
gulp.task('build', ['clean', 'img' ,'css-libs', 'js'], function () {

    var buildCss = gulp.src('app/css/*.css')
        .pipe(gulp.dest('dist/css/'));

    var buildFonts = gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('dist/fonts/'));

    var buildJs = gulp.src('app/js/**/*')
        .pipe(gulp.dest('dist/js/'));

    var buildHtml = gulp.src('app/*.html')
        .pipe(gulp.dest('dist/'));

});

//чистит кэш
gulp.task('clear', function (callback) {
    return cache.clearAll();
});

gulp.task('default', ['watch']);
