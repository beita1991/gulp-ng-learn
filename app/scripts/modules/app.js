/**
 * Created by zhouwei on 2017/2/14.
 */
/**
 * angular 项目启动文件
 *  模块功能引入
 *  ui.route的config
 *  run
 */
"use strict";
angular.module('gulp-ng-learn', [
    'ui.router',
    'gulp.task',
    'gulp.main',
    'gulp.templates'
])
    .config(function ($stateProvider, $urlRouterProvider, $sceDelegateProvider, AppConstant) {

        $urlRouterProvider.otherwise(function () {
            return '/main/task';
        });
    })
    //这里面可以放全局rootScope 但是能不用就不用,尽量用service代替
    .run(function ($rootScope) {
        console.log("=======run======");
        $rootScope.global = {};

    });

