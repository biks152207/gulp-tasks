(function() {
    app.controller('loginController', function( $scope, $stateParams, $state, $ionicLoading, TodoZuDB,
                                               user, sharedData, message, userModel, pushNotification, connectivity,$timeout,$q,$rootScope ) {


        $scope.credentials = {};
        $scope.isReady=false;

        $scope.showMessage = function(msg){
            $scope.alert = {
                title: msg.title,
                msg: msg.message,
                success: msg.success
            };
        };

        $scope.login = function () {
            TodoZuDB.dropDatabase();
            if($scope.credentials.email && $scope.credentials.password){
                $scope.credentials.deviceInfo=$scope.credentials.deviceInfo||{};
                $scope.credentials.deviceInfo.uid= userModel.getDeviceUniqueId();
                $scope.credentials.deviceInfo.device_type= ionic.Platform.platform();
                $scope.credentials.deviceInfo.device_token= userModel.getDeviceToken();

                $ionicLoading.show();
                $rootScope.isLoginProgress=true;
                user.login($scope.credentials).then(function(results){

                    $scope.alert = {};
                   if(results.error){
                       //$ionicLoading.hide();
                        $scope.showMessage(results.message);
                    }
                    else{

                       sharedData.home();
                       $rootScope.$emit('connect-socket');
                       $rootScope.$emit('login-success');
                       //self.connect();
                   }
                })
                .finally(function(){
                        $rootScope.isLoginProgress=false;
                     $timeout(function(){
                         $ionicLoading.hide();
                     },200)  ;

                });
            }

        };

        $scope.start = function () {
            //checkDeviceRegistration();
            if (connectivity.checkConnection()) {


                $scope.credentials.deviceInfo = {
                    uid: userModel.getDeviceUniqueId(),
                    device_type: ionic.Platform.platform(),
                    device_token: userModel.getDeviceToken()
                };

                }
            else{
                //$scope.showMessage(message.);
                //$scope.isReady=
            }
            var requestLoginEmail = userModel.getRequestLoginEmail();
            if (requestLoginEmail) {
                $scope.credentials.email = requestLoginEmail;
                userModel.removeRequestLoginEmail();
            }
            $scope.alert = message.getAlert();
            message.clearAlert();
        };

        //$rootScope.$on('network-connected',function(){
        //
        //        checkDeviceRegistration();
        //
        //});

        function checkDeviceRegistration(){
            var defer=$q.defer();
            if(userModel.getDeviceUniqueId()){
               $scope.isReady=true;
                defer.resolve(true);
            }
            else{
                $scope.isReady=false;
                if(!pushNotification.initialized){
                    pushNotification.init()
                        .then(function(){
                            pushNotification.getDeviceUniqueId()
                                .then(function(){
                                    $scope.isReady=true;
                                    defer.resolve(true);
                                },function(){

                                });
                        });
                }
                else{
                    pushNotification.getDeviceUniqueId()
                        .then(function(){
                            $scope.isReady=true;
                            defer.resolve(true);
                        },function(){

                        });
                }


            }

            return defer.promise;
        }

        $scope.start();

    });
}).call(this);
