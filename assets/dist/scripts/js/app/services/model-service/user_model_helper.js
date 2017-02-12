
(function(){
    app.service('userModelHelper',['$q','$http','connectivity','API','userModel','RESPONSE_CODE',function($q,$http,connectivity,API,userModel,RESPONSE_CODE){
        var self=this;
        self.getLoggedInUserTotalStorage=function(){
            return $q(function(resolve,reject){
                if(connectivity.isConnected()){
                    var user=userModel.getLoggedInUser();

                    $http.post(API.user.totalStorage, {userId:user._id})
                        .then(function (response) {
                            var results=response.data;
                            if (results.response_code === RESPONSE_CODE.SUCCESS) {
                                resolve(results.data.totalSize);

                            } else if (results.response_code === RESPONSE_CODE.ERROR) {

                                defer.resolve({
                                    error: true,
                                    message: message.errorMessages[results.errors.value]
                                });
                            }

                        },reject);

                }
                else{
                    defer.resolve({
                        error: true,
                        message: message.errorMessages.CONNECTION_ERROR
                    });
                }


            });
        }
    }]);
})();