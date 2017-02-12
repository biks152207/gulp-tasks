(function(){
    app.service('toastService', ["$rootScope", "toastr", "toastrConfig", "$templateCache", "$ionicListDelegate", "$ionicLoading", "$state", "platformService", "$timeout", function($rootScope, toastr, toastrConfig, $templateCache,
                                         $ionicListDelegate, $ionicLoading, $state,platformService,$timeout){
        var self  = this;

        var notificationData;
        var isUndo = false;
        var defaultTemplate = $templateCache.get('directives/toast/toast.html');

        /*function notificationToastTemplate(title, message) {

            return '<div class = "toast-notification" ng-click="notificationRedirectTo()">' +
                ' <span class="toast-title">'+title+'</span> ' +
                ' <span class="toast-message">'+message+'</span>'+
                '<button class="toast-close" ng-click="$event.stopImmediatePropagation();closeNotificationToast()"><i class="tdzicon-close"></i></button></div>';
        }*/

        function undoToastTemplate() {

            return '<div class = "toast-undo">' +
                ' <span class="toast-message">Task completed</span> ' +
                '<button class="undo-button" ng-click="undoToast()">UNDO</button></div>';
        }

        self.setDefaultToast = function(){

            $templateCache.remove('directives/toast/toast.html');
            angular.extend(toastrConfig, {
                positionClass:platformService.isMobileDevice()? 'toast-bottom-full-width':'toast-bottom-center',
                tapToDismiss: true,
                timeOut: 3000,
                preventOpenDuplicates:true,
                preventDuplicates:false,
                onShown:function(tost){
                    console.log('Showing toast - '+ (tost.scope.message?tost.scope.message.toString():'') + '    '+tost.scope.toastId);
                    //console.log(tost);
                }
                ,onHidden:function(isClick,tost){
                    console.log('Hiding toast - ' + (tost.scope.message?tost.scope.message.toString():'') + '    '+tost.scope.toastId);
                    //console.log(tost);
                }
                //, extendedTimeOut:500000
            });
            $templateCache.put('directives/toast/toast.html', defaultTemplate);

        };

        /*self.openNotificationToast = function(title, message, data){
            toastr.clear();
            $templateCache.remove('directives/toast/toast.html');
            notificationData = data;
            toastr.clear();
            angular.extend(toastrConfig, {
                positionClass: 'toast-top-right',
                timeOut: 0,
                onHidden: function(){
                    self.setDefaultToast();
                }
            });
            $templateCache.put('directives/toast/toast.html', notificationToastTemplate(title, message));
            toastr.success();
        };*/

        self.openTaskCompleteToast = function(){
            //toastr.clear();
            $templateCache.remove('directives/toast/toast.html');
            angular.extend(toastrConfig, {
                positionClass: platformService.isMobileDevice()? 'toast-bottom-full-width':'toast-bottom-center',
                tapToDismiss: false,
                onHidden: function(){
                    $rootScope.$emit('bulk-complete:response', isUndo);
                    self.setDefaultToast();
                    isUndo = false;
                }
                ,preventOpenDuplicates:true
                //, extendedTimeOut:5000000
            });
            $templateCache.put('directives/toast/toast.html', undoToastTemplate());
            var theToast=toastr.success();
            cleanToast(theToast,3500);
        };

        /*$rootScope.closeNotificationToast = function(){
            toastr.clear();
            self.setDefaultToast();
        };*/

        $rootScope.undoToast = function () {
            isUndo = true;
            toastr.clear();
        };



        $rootScope.$on('toast-message',function(event, item){

            self.setDefaultToast();
            var theToast;
            if(item.success) {
                theToast=toastr.success(item.title);
            }
            else {
                theToast=toastr.error(item.title);
            }
            cleanToast(theToast,3500);
        });


        function cleanToast(theToast,timeout){
            $timeout(function(myToast){
                return function(){
                    if(myToast && myToast.isOpened){
                        toastr.remove(myToast.scope.toastId);
                    }
                }
            }(theToast),timeout!==undefined?timeout:3500);
        }

        $(document).on('click','ion-side-menu,ion-header-bar',function(){
            toastr.clear();
        });

        //var oldConsoleLog=console.log;
        //window.myLogs=[];
        //console.log=function(msg){
        //    oldConsoleLog.apply(window,arguments);
        //    window.myLogs.push(msg);
        //    //Rollbar.info(msg);
        //}

        /*$rootScope.notificationRedirectTo = function(){
            toastr.clear();
            self.setDefaultToast();
            $state.go(notificationData.state, {id : notificationData.params});
        };*/

    }]);
}).call(this);
