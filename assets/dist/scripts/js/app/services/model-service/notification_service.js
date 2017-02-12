(function(){
    app.service('notificationService', ["$rootScope", "$q", "$http", "API", "RESPONSE_CODE", "message", "connectivity", "userModel", "notificationModel", function($rootScope, $q, $http, API, RESPONSE_CODE,
                                                message, connectivity, userModel, notificationModel){
        var self  = this;

        self.getAllNotificationsByUserId = function(skip, limit){

            var defer = $q.defer();
            if(connectivity.isConnected()){

                var data = {
                    skip: skip,
                    limit: limit,
                    userId: userModel.getLoggedInId()
                };
                $http.post(API.notification.getByUserId, data)
                    .success(function (results) {
                        if(results.response_code === RESPONSE_CODE.SUCCESS){
                            defer.resolve(results.data);
                        }
                        else if (results.response_code === RESPONSE_CODE.ERROR) {

                            defer.resolve({
                                error:true,
                                msg: message.errorMessages[results.errors.value],
                                results: results
                            });
                        }
                    })
                    .error(function (results) {
                        defer.resolve({
                            error:true,
                            msg: message.errorMessages.GENERAL,
                            results: results
                        });
                    });


            }
            else{
                defer.resolve({
                    error:true,
                    msg: message.errorMessages.CONNECTION_REQUIRED
                });
            }
            return defer.promise;
        };


        self.getNotifications = function(){
            var defer = $q.defer();
            notificationModel.getAll(function(err, list){
                defer.resolve(list);
            });

            return defer.promise;
        };

        self.getNoOfUnseen = function(){
          var defer = $q.defer();
            notificationModel.getNoOfUnseen(function(err, n){
                defer.resolve(n);
            });
          return defer.promise;
        };

        self.seenNotifications = function(){
            if(connectivity.isConnected()){
                $http.post(API.notification.seen, {
                    userId: userModel.getLoggedInId()
                });
            }
            notificationModel.bulkSeen(function(){});
        };
    }]);
}).call(this);
