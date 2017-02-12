(function(){
    app.service('historyService', function($q, $http, taskService, connectivity, API, RESPONSE_CODE, message, userModel){

        var self = this;
        self.getAllHistories = function(skip, limit){

            var defer = $q.defer();
            if(connectivity.isConnected()){
                var data = {
                    skip: skip,
                    limit: limit,
                    userId: userModel.getLoggedInId()
                };
                $http.post(API.history.GET.all, data)
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

        self.getHistoriesByTaskId = function(taskId, skip, limit){

            var defer = $q.defer();
            if(connectivity.isConnected()){

                var data = {
                    skip: skip,
                    limit: limit,
                    taskIds: [taskId]
                };
                $http.post(API.history.GET.historiesByTask, data)
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

    });
}).call(this);