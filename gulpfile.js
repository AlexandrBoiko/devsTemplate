// plugins for development
var gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    svgSprite = require('gulp-svg-sprite'),
    rimraf = require('rimraf'),
    plumber = require('gulp-plumber'),
    inlineimage = require('gulp-inline-image'),
    pug = require('gulp-pug'),
    sass = require('gulp-sass'),
    prefix = require('gulp-autoprefixer'),
    dirSync = require('gulp-directory-sync'),
    sourcemaps = require('gulp-sourcemaps'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    uglify = require('gulp-uglify'),
    purify = require('gulp-purifycss'),
    csso = require('gulp-csso'),
    concat = require('gulp-concat'),
    spritesmith = require('gulp.spritesmith'),
    svgmin = require('gulp-svgmin');

var assetsDir = 'assets/';
var outputDir = 'dist/';
var buildDir = 'build/';
//livereload and open project in browser
gulp.task('browser-sync', function() {
    browserSync.init({
        port: 1337,
        server: {
            baseDir: outputDir
        }
    });
});
gulp.task('pug', function() {
    gulp.src([assetsDir + 'pug/*.pug', '!' + assetsDir + 'pug/_*.pug'])
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest(outputDir))
        .pipe(browserSync.stream());
});
gulp.task('sass', function() {
    gulp.src([assetsDir + 'sass/**/*.sass', '!' + assetsDir + 'sass/**/_*.sass'])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(inlineimage())
        .pipe(prefix('last 3 versions'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(outputDir + 'styles/'))
        .pipe(browserSync.stream());
});
gulp.task('jsConcat', function() {
    return gulp.src(assetsDir + 'js/all/**/*.js')
        .pipe(concat('all.js', {
            newLine: ';'
        }))
        .pipe(gulp.dest(outputDir + 'js/'))
        .pipe(browserSync.stream());
});
gulp.task('svgSpriteBuild', function() {
    return gulp.src(assetsDir + 'i/icons/*.svg')
        // minify svg
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        // build svg sprite
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "../sprite.svg",
                    render: {
                        scss: {
                            dest: '../../../sass/_sprite.scss',
                            template: assetsDir + "sass/templates/_sprite_template.scss"
                        }
                    },
                    example: true
                }
            }
        }))
        .pipe(gulp.dest(assetsDir + 'i/sprite/'));
});
gulp.task('sprite', function() {
    var spriteData = gulp.src('assets/sprite-png/*.png').pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: '_sprite-png.scss'
    }));
    spriteData.css.pipe(gulp.dest('assets/sass/'));
    spriteData.img.pipe(gulp.dest('assets/i/sprite/'));
});
gulp.task('imageSync', function() {
    return gulp.src('')
        .pipe(plumber())
        .pipe(dirSync(assetsDir + 'i/', outputDir + 'i/', {
            printSummary: true
        }))
        .pipe(browserSync.stream());
});
gulp.task('fontsSync', function() {
    return gulp.src('')
        .pipe(plumber())
        .pipe(dirSync(assetsDir + 'fonts/', outputDir + 'fonts/', {
            printSummary: true
        }))
        .pipe(browserSync.stream());
});

gulp.task('jsSync', function() {
    return gulp.src(assetsDir + 'js/*.js')
        .pipe(plumber())
        .pipe(gulp.dest(outputDir + 'js/'))
        .pipe(browserSync.stream());
});

gulp.task('watch', function() {
    gulp.watch(assetsDir + 'pug/**/*.pug', ['pug']);
    gulp.watch(assetsDir + 'sass/**/*.*', ['sass']);
    gulp.watch(assetsDir + 'js/**/*.js', ['jsSync']);
    gulp.watch(assetsDir + 'js/all/**/*.js', ['jsConcat']);
    gulp.watch(assetsDir + 'i/**/*', ['imageSync']);
    // gulp.watch(assetsDir + 'sprite-png/*.png', ['sprite']);
    gulp.watch(assetsDir + 'fonts/**/*', ['fontsSync', 'fontsConvert']);
});
gulp.task('default', ['pug', 'sprite', 'sass', 'fontsSync', 'svgSpriteBuild', 'imageSync',
    'jsConcat', 'jsSync', 'watch', 'browser-sync'
]);
