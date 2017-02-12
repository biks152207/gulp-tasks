
/**
 * Created by skyestreamptyltd on 6/20/16.
 */

(function(){
    app.directive('passwordValidation',['$q','user','connectivity',function($q,user,connectivity){
        return {
            require:'ngModel',
            link:function(scope,elem,attrs,ctrl){
                ctrl.$asyncValidators.password=function(modelValue,viewValue){
                    if(ctrl.$isEmpty(modelValue)||!connectivity.isConnected()){
                        return $.when();
                    }
                    //if(!connectivity.isConnected()){
                    //
                    //}

                    var defer=$q.defer();

                    user.validatePassword(modelValue)
                        .then(function(result){
                             if(result){
                                 defer.resolve();
                             }
                            else{
                                 defer.reject();
                             }

                        },function(err){
                            defer.reject();
                        });

                    return defer.promise;
                }
            }
        }
    }]);
})();
