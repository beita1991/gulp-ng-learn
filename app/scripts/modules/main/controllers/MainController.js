/**
 * Created by zhouwei on 2017/2/14.
 */
angular.module('gulp.main.controllers.MainController', [])
    .controller('MainController',function(gettextCatalog,$state){
        console.log('MainController');
        var vm=this;
        vm.changeLanguage=function(language){
            gettextCatalog.setCurrentLanguage(language);
            $state.go('main.task',{},{reload:true});

        };


    });

