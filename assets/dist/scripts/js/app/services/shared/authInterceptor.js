
app.service('authInterceptor', ["$window", "$window", "$q", "TodoZuDB", function($window,$window,$q,TodoZuDB){
    this.request = function(config){
        var token = $window.localStorage.getItem('token');
        if (token){
            config.headers = config.headers || {};
            config.headers['x-access-token'] = token;
        }
        var socketInfo=JSON.parse($window.localStorage.getItem('socketInfo')||'{}');
        if(socketInfo.id){
            config.headers['x-socket-id']=socketInfo.id;
        }
        return config;
    };
    //this.response=function(response){
    //    if(response.data && response.data.response_code==401){
    //        //user.clearAll();
    //        //socket.disconnect();
    //        //userModel.clearSession();
    //        $window.localStorage.clear();
    //        TodoZuDB.dropDatabase();
    //        $window.location.href='#/login';
    //        ////$ionicLoading.hide();
    //
    //        //$state.go('/login');
    //        return $q.reject(response);
    //    }
    //    var headers=response.headers();
    //    if(headers && headers['DB-VERSION']){
    //        console.log(headers['DB-VERSION']);
    //    }
    //    return response;
    //};
}]);