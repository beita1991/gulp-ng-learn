/**
 * Created by zhouwei on 2017/2/13.
 */
var gulp = require('gulp'),
    plugin = require('gulp-load-plugins')(),
    runSequence = require('run-sequence').use(gulp),
    ngTemplateCache = require('gulp-angular-templatecache'),
    del = require('del'),
    config = require('./gulpconfigs');

var jsSrc = 'app/scripts/**/*.js',
    cssSrc = ['app/styles/**/*.css','app/styles/**/*.scss'],
    templatesSrc=['app/views/**/*.html']

gulp.task('default', function() {
    // 将你的默认的任务代码放在这

});

//语法检查
gulp.task('jshint', function () {
    return gulp.src(jsSrc)
        .pipe(plugin.jshint())
        .pipe(plugin.jshint.reporter('jshint-stylish'));
});

//压缩,合并 js
gulp.task('js', function() {
    return gulp.src(jsSrc)      //需要操作的文件
        .pipe(plugin.plumber())
    /*jshint camelcase:false*/
        .pipe(plugin.ngAnnotate({add: true, single_quotes: true}))
    /*jshint camelcase:true*/
        .pipe(plugin.removeUseStrict({force: true}))

        .pipe(plugin.concat('main.js'))    //合并所有js到main.js
        .pipe(plugin.wrapper({
            header: '(function(){\'use strict\';\n',
            footer: '\n}());'
        }))
        .pipe(gulp.dest('dist/js'))       //输出到文件夹
        .pipe(plugin.rename({suffix: '.min'}))   //rename压缩后的文件名
        .pipe(plugin.uglify())    //压缩
        .pipe(gulp.dest('dist/js'));  //输出
});

//压缩css
gulp.task('css', function() {
    return gulp.src('css/*.css')    //需要操作的文件
        .pipe(rename({suffix: '.min'}))   //rename压缩后的文件名
        .pipe(minifycss())   //执行压缩
        .pipe(gulp.dest('Css'));   //输出文件夹
});

gulp.task('html', function () {
    del.sync('dist/js/templates.js');
    var path = templatesSrc;
    return gulp.src(path)
        .pipe(ngTemplateCache('gulp_ng_tpl.js', {
            base      : function (f) {
                return f.path.replace(f.cwd + '\\', '');
            },
            module    : 'gulp.templates',
            standalone: true
        }))
        .pipe(plugin.uglify())
        //.pipe(plugin.rev())
        .pipe(gulp.dest('dist/js'));
});


gulp.task('build', function () {
    runSequence('jshint', 'js', 'css', 'inject');
});

//默认命令,在cmd中输入gulp后,执行的就是这个任务(压缩js需要在检查js之后操作)
gulp.task('default', ['build']);


