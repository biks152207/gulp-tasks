/**
 * Created by skyestreamptyltd on 8/7/16.
 */

(function(){
    app.service('loggingService',['$rootScope','userModel','$window',function($rootScope,userModel,$window){
        var self=this;
        self.init=function(){
            if($window.cordova && $window.Rollbar){
                //window.cordova.Rollbar.init();
                $window.Rollbar.init();
                console.log('cordova rollbar initialized');
            }
            else{

                console.log('cordova rollbar not found');
                if($window.cordova){
                    console.log($window.cordova.plugins);
                }
            }
            if(!$window.cordova){
                registerUser();
                $rootScope.$on('login-success',function(){
                    registerUser();
                });
                $rootScope.$on('logoff-success',function(){
                    unRegisterUser();
                });
            }

        }

        function registerUser(){
            if(userModel.isAuthenticated()){
                var usr=userModel.getLoggedInUser();
                var opt={payload: {
                    person: usr
                }};
                if(usr){
                   if($window.Rollbar){
                       $window.Rollbar.configure(opt);
                   }

                }
            }

        }

        function unRegisterUser(){
            if($window.Rollbar){
                $window.Rollbar.configure({
                    payload:{
                        person:null
                    }
                })
            }

        }
    }]);
})();