/**
 * Created by skyestreamptyltd on 8/5/16.
 */
(function(){
   app.service('httpAllInterceptor',['$rootScope','$window','$q','TodoZuDB','userModel','message','$timeout',function($rootScope,$window,$q,TodoZuDB,userModel,message,$timeout){
       var logOffInProgress=false;
        this.response=function(response){
            return $q(function(resolve,reject){
                try{
                    resolve(response);
                    //return response;
                }
                finally{
                    $timeout(function(){
                        if(userModel.isAuthenticated()){
                            checkVersionInfo(response);
                        }
                    });


                }

            })

        };

       function checkVersionInfo(response){
           try{

               var headers=response.headers();
               if(headers['x-api-version']){
                   console.log('api version : '+headers['x-api-version']);
                   var newVersionStr=headers['x-api-version'];
                   var newVersion=parseInt((headers['x-api-version'] ||'').replace(/\./g,''));
                   var oldVersionStr=$window.localStorage.getItem('x-api-version');
                   if(oldVersionStr  ){
                       var olderVersion=parseInt(($window.localStorage.getItem('x-api-version') ||'').replace(/\./g,''));
                       if(olderVersion!=newVersion){

                           $rootScope.$emit('api-version-changed',newVersionStr);

                       }
                   }
                   else {
                       $window.localStorage.setItem('x-api-version',newVersionStr);
                   }
               }
           }
           catch(e){
               console.log('Error in version check');
               console.log(e);
           }
           finally{
               return response;
           }
       }
   }]) ;
})();