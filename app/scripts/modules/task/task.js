/**
 * Created by zhouwei on 2017/2/14.
 */
angular.module('gulp.task', [
    'gulp.task.controllers'
])
    .config(function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('main.task', {
                url: '/task',
                templateUrl: 'views/task/task.html',
                controller: 'TaskController',
                controllerAs: 'vm'
            })
        ;
    });
