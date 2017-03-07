/**
 * Created by zhouwei on 2017/2/13.
 */
/**
 * 功能： js、css、html 打包压缩，
 *        jshint、sourcemaps
 */
var gulp = require('gulp'),
    plugin = require('gulp-load-plugins')(),
    runSequence = require('run-sequence').use(gulp),
    ngTemplateCache = require('gulp-angular-templatecache'),
    del = require('del'),
    config = require('./gulpconfigs'),
    gettext = require('gulp-angular-gettext');

var browserSync = require('browser-sync');
var webserver = require('gulp-webserver');
var paths = {
    js: ['./app/scripts/**/*.js'],
    css: ['./app/styles/**/*.css','./app/styles/**/*.scss'],
    templates: ['./app/views/**/*.html'],
    buildjs: ['./dist/js/**/*.js'],
    buildcss: ['./dist/css/**/*.css']
};

//多语言--获取模版中需要翻译的文字
gulp.task('pot', function () {
    return gulp.src(['app/*.html', 'app/views/**/*.html', 'app/scripts/**/*.js'])
        .pipe(gettext.extract('template.pot'))
        .pipe(gulp.dest('app/po/'));
});
//多语言--将 po 文件转化为 js文件
gulp.task('translations', function () {
    return gulp.src('./app/po/*.po')
        .pipe(gettext.compile())
        .pipe(plugin.concat('translations.js'))    //合并所有js到main.js
        .pipe(gulp.dest('app/scripts/i18n/'));
});


function bowerFiles() {
    return [
        './bower_components/jquery/dist/jquery.js',
        // './bower_components/bootstrap/dist/js/bootstrap.js',
        './bower_components/angular/angular.js',
        './bower_components/angular-gettext/dist/angular-gettext.js',
        './bower_components/angular-ui-router/release/angular-ui-router.js'
    ]
}
function bowerCss(){
    return [
        './bower_components/bootstrap/dist/css/bootstrap.min.css',
    ]
}

var names = {
    app   : 'app.all',
    appMin: 'app.all.min'
};

// gulp.task('default', function () {
//     gutil.log('message')
//     gutil.log(gutil.colors.red('error'))
//     gutil.log(gutil.colors.green('message:') + "some")
// })

gulp.task('clean', function() {
    // You can use multiple globbing patterns as you would with `gulp.src`
    return del(['./dist']);
});

//语法检查
gulp.task('jshint', function () {
    return gulp.src(paths.js)
        .pipe(plugin.jshint())
        .pipe(plugin.jshint.reporter('jshint-stylish'));
});

// loadMaps: true
//sourcemaps   loadMaps 为 false 时候 不使用 sourcemaps
function onError (err) {
    plugin.util.beep();
    console.log(err);
    this.emit('end');
}

//合并与压缩 js
gulp.task('js', function() {
    return gulp.src(paths.js)      //需要操作的文件
        .pipe(plugin.sourcemaps.init({loadMaps: true,largeFile: true}))
        .pipe(plugin.plumber({
            errorHandler: onError
        }))
    /*jshint camelcase:false*/
        .pipe(plugin.ngAnnotate({add: true, single_quotes: true}))
    /*jshint camelcase:true*/
        .pipe(plugin.removeUseStrict({force: true}))
        .pipe(plugin.concat('main.js'))    //合并所有js到main.js
        .pipe(plugin.wrapper({
            header: '(function(){\'use strict\';\n',
            footer: '\n}());'
        }))
        .pipe(gulp.dest('./dist/js'))       //输出到文件夹
        .pipe(plugin.uglify())    //压缩
        .pipe(plugin.rename({suffix: '.min'}))   //rename压缩后的文件名
        .pipe(plugin.sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/js'));  //输出
});

// //使用ng-annotate进行angular模块依赖自动注入, 引入模块自动加[],防止被混淆
// gulp.task('ng_annotate', ['templatecache'], function() {
//     return gulp.src(paths.ng_annotate)
//         .pipe(ngAnnotate({single_quotes: true}))
//         .pipe(gulp.dest('.tmp/'));
// });

//合并与压缩引入的第三方 js
gulp.task('vendorJs', function() {
    return gulp.src(bowerFiles())
        .pipe(plugin.concat('vendor.js'))
        .pipe(gulp.dest('./dist/js'))       //输出到文件夹
        .pipe(plugin.rename({suffix: '.min'}))   //rename压缩后的文件名
        .pipe(gulp.dest('./dist/js'))
});

//合并与压缩css
gulp.task('css', function () {
    return gulp.src(paths.css)    //需要操作的文件
        .pipe(plugin.sourcemaps.init())
        .pipe(plugin.plumber(
            {
                errorHandler: function (error) {
                    plugin.util.log(
                        error.toString()
                    );
                    stream.end();
                }
            }))
        .pipe(plugin.concat('main.scss'))
        .pipe(plugin.sass({
            outputStyle: 'compressed'
        }).on('error', plugin.sass.logError))
        // .pipe(plugin.sourcemaps.write({includeContent: false}))
        .pipe(plugin.autoprefixer({browsers: ['last 2 versions']}))
        .pipe(plugin.concat('main.css'))
        .pipe(plugin.minifyCss())   //执行压缩
        .pipe(plugin.rename({suffix: '.min'}))   //rename压缩后的文件名
        .pipe(plugin.sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/css'));   //输出文件夹
});

//合并与压缩第三方css
gulp.task('vendorCss', function() {
    return gulp.src(bowerCss())
        .pipe(plugin.concat('vendor.css'))
        .pipe(gulp.dest('./dist/css'))   //输出文件夹
        .pipe(plugin.minifyCss())   //执行压缩
        .pipe(plugin.rename({suffix: '.min'}))  //rename压缩后的文件名
        .pipe(gulp.dest('./dist/css'));   //输出文件夹
});

//打包html
gulp.task('html', function () {
    del.sync('dist/js/templates.js');
    var path = paths.templates;
    return gulp.src(path)
        .pipe(ngTemplateCache('templates.js',{
            base      : function (f) {
                return f.path.replace(f.cwd+'\/app' + '\/', '');
            },
            module    : 'gulp.templates',
            standalone: true
        }))
        .pipe(plugin.uglify())
        .pipe(gulp.dest('dist/js'));
});


// 在index.html中添加对应的css和js文件
gulp.task('inject', ['css','vendorCss','js','vendorJs'], function () {
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    return gulp.src('./app/index.html')
        .pipe(plugin.inject(gulp.src('./dist/css/main.min.css', {read: false}), {relative: true}))
        .pipe(plugin.inject(gulp.src('./dist/css/vendor.min.css', {read: false}), {name: 'bower',relative: true}))
        .pipe(plugin.inject(gulp.src('./dist/js/main.min.js', {read: false}), {relative: true}))
        .pipe(plugin.inject(gulp.src('./dist/js/vendor.min.js', {read: false}), {name: 'bower', relative: true}))
        .pipe(plugin.inject(gulp.src('./dist/js/templates.js', {read: false}), {name: 'templates', relative: true}))
        .pipe(gulp.dest('./dist/'));
});

// 将js添加进 index.html 页面
gulp.task('jsIndex', ['js','vendorJs'], function () {
    gulp.src('./dist/index.html')
        .pipe(plugin.inject(gulp.src('./dist/js/main.js', {read: false}), {relative: true}))
        .pipe(plugin.inject(gulp.src('./dist/js/vendor.js', {read: false}), {name: 'bower', relative: true}))
        .pipe(gulp.dest('./dist/'));
});

// 将js添加进 index.html 页面
gulp.task('cssIndex', ['css','vendorCss'], function () {
    gulp.src('./dist/index.html')
        .pipe(plugin.inject(gulp.src('./dist/css/main.min.css', {read: false}), {relative: true}))
        .pipe(plugin.inject(gulp.src('./dist/css/vendor.min.css', {read: false}), {name: 'bower',relative: true}))
        .pipe(gulp.dest('./dist/'));
});

//添加导入的字体
gulp.task('fonts', function () {
    return gulp.src(require('main-bower-files')().concat(['app/fonts/**/*','bower_components/bootstrap/fonts/**/*']))
        .pipe(plugin.filter('**/*.{eot,svg,ttf,woff,woff2,otf}'))
        .pipe(plugin.flatten())
        .pipe(gulp.dest('.tmp/fonts'))
        .pipe(gulp.dest('dist/fonts'));
});


gulp.task('watchStyle', function () {
    return  gulp.watch(paths.css, ['css'],browserSync.reload);
});

gulp.task('watchJs', function () {
    return gulp.watch(paths.js, ['js'],browserSync.reload);
});

gulp.task('watchHtml', function () {
    return gulp.watch(paths.templates, ['html'],browserSync.reload);
});
// 监听 css、js、html
gulp.task('watch', ['watchStyle', 'watchJs','watchHtml']);

var serverSrc= ['./app/scripts/**/*.js','./app/styles/**/*.css','./app/styles/**/*.scss','./app/views/**/*.html'];

var serverSrcDist= ['./dist/**'];


// 服务启动任务
gulp.task('browserSync', ['watch'],function () {
    return browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['./'],
            index: "dist/index.html"
        },
        reloadDelay: 500 ,// 延迟刷新
        files: serverSrcDist
    });
});

// 启动serve
gulp.task('serve', function(cb) {
    runSequence('build','browserSync',cb);
});

// 构建项目
gulp.task('build', function (cb) {
    runSequence('clean', 'jshint','html','inject', 'fonts',cb);
});

//默认命令,在cmd中输入gulp后,执行的就是这个任务
gulp.task('default', ['serve']);

gulp.task('help', function () {
    console.log(plugin);
});

