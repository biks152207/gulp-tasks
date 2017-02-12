(function () {
    app.controller('defaultViewController', function ($rootScope, $scope, $ionicTabsDelegate, taskListView) {

        $rootScope.default = {
          edit: true
        };

        $scope.toggleTab = function(index){

            var beforeDefaultViewTabSwitchEvent=$rootScope.$broadcast('default:tabswitch');

            if(beforeDefaultViewTabSwitchEvent.defaultPrevented){
                if(beforeDefaultViewTabSwitchEvent.promise){
                    beforeDefaultViewTabSwitchEvent.promise.then(function(canSwitch){
                        if(canSwitch){
                            switchTab(index);
                        }
                    });
                }
            }
            else{
                switchTab(index);
            }
        };

        function switchTab(index){
            $ionicTabsDelegate.select(index);
            $rootScope.default.edit = !index;
        }
        var  taskCompletedListener = $rootScope.$on('task:bulkCompleted', function(){
            taskListView.clearAllSelected();
            taskListView.setDefaultView();
        });

       $scope.$on('$destroy', function(){
           taskCompletedListener();
       });


    });

}).call(this);
