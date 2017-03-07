/**
 * Created by zhouwei on 2017/2/14.
 */
/**
 * angular 项目启动文件
 *  模块功能引入
 *  ui.route的config
 *  run
 */
angular.module('gulp-ng-learn', [
    'ui.router',
    'demo.components',
    'gulp.task',
    'gulp.main',
    'gulp.templates',
    'gettext'
])
    .config(function ($urlRouterProvider) {

        $urlRouterProvider.otherwise(function () {
            return '/main/task';
        });
    })
    //这里面可以放全局rootScope 但是能不用就不用,尽量用service代替
    .run(function ($rootScope,gettextCatalog,$state) {
        console.log("=======run=== ===tttt,t");

    });

