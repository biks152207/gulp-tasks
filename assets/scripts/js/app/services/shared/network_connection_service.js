(function () {
    app.service('connectivity', function ($rootScope, $timeout, message) {

        var self = this;

        self.checkConnection  =  function (){
            //only for android device
            if(navigator.connection) {
                return !(navigator.connection.type == 'none');
            }
            else {
                //for web browser and ios
                return navigator.onLine;
           }

        };

        self.isConnected = function(){
            return navigator.onLine;
        };

        self.startMonitor = function(){
            $rootScope.connected =true;

            window.addEventListener("online", function(e) {
                $rootScope.connected =true;
                $rootScope.$emit('toast-message', message.successMessages.CONNECTION_ESTABLISHED);
               $timeout(function(){
                   $rootScope.$emit('network-connected');
                   $rootScope.$emit('connect-socket');
                   $rootScope.$emit('push-to-server', true);
               },500);

            }, false);

            window.addEventListener("offline", function(e) {
                $rootScope.connected = false;
                $rootScope.$emit('network-disconnected');
                $rootScope.$emit('disconnect-socket');
                $rootScope.$emit('toast-message', message.errorMessages.CONNECTION_ERROR);
            }, false);

            document.addEventListener("resume",function(){
                $timeout(function(){
                    $rootScope.$emit('network-connected');
                    $rootScope.$emit('push-to-server', true);
                },500);
            }, false);
        };


    });
}).call(this);
