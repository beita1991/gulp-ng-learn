/**
 * Created by zhouwei on 2017/2/14.
 */
angular.module('gulp.main', [
    'gulp.main.controllers'
])
    .config(function ($stateProvider) {

        $stateProvider
            .state('main', {
                url: '/main',
                templateUrl: 'views/main.html',
                controller: 'MainController',
                controllerAs: 'vm'
            })
        ;
    });
