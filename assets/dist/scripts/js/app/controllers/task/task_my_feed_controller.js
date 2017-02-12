(function () {
    app.controller('taskMyFeedController', ["$rootScope", "$q", "$scope", "taskService", "connectivity", "date", "$ionicLoading", "settingsService", "project", "sharedData", "historyService", "dbEnums", "asyncStackService", "$timeout", function ($rootScope, $q,  $scope, taskService, connectivity, date, $ionicLoading,
                                                    settingsService, project, sharedData, historyService,dbEnums,asyncStackService,$timeout) {

        $scope.noMoreItemsAvailable = false;
        var completedTaskAsyncStacker=asyncStackService.createStacker(); //TODO: use throttle if possible

        var skip = 0;
        var limit = 20;

        function loadMoreItems(){
            if(connectivity.isConnected()){
                return historyService.getAllHistories(skip, limit, $scope.taskIds, $scope.projectIds).then(function(results){

                    //$timeout(function(){
                        $ionicLoading.hide();
                        if(results.length){
                            results.forEach(function(item){
                                item.icon  = sharedData.EVENT_ICONS[item.key];
                                if(item.type==dbEnums.status.reopened){
                                    item.icon=sharedData.EVENT_ICONS[item.type.toUpperCase()];
                                }
                                item.dateTime = date.getDateTime(item.date_modified);
                                $scope.items.push(item);
                            });
                            skip +=limit;
                        }
                        else  $scope.noMoreItemsAvailable = true;

                        $rootScope.$broadcast('scroll.infiniteScrollComplete');
                    //},100);

                });

            }
            else{
                $scope.noMoreItemsAvailable = true;
                $ionicLoading.hide();
            }
        }

        $scope.loadMore = function() {

            completedTaskAsyncStacker.stack(loadMoreItems);

        };

        $scope.items = [];

        $scope.start = function () {

            $scope.title = 'My feeds';
            $scope.type = 'myFeed';
            $ionicLoading.show();
            $rootScope.$emit('left-menu:selected', $scope.type);
            taskService.taskCount().then(function(numberOfTask){
                $rootScope.$emit('task:header-taskList', $scope.type, numberOfTask, null, true);
            });
            $scope.allFloatButtons = settingsService.getSettings().float_button ? parseInt(settingsService.getSettings().float_button.value) : null;


        };

        $scope.start();

        $scope.$on('$destroy',function(){
            stateChangeListener();
            completedTaskAsyncStacker.clear();
        });

        var stateChangeListener=$rootScope.$on("$stateChangeStart",function(){
            $rootScope.$emit('left-menu:selected',  null);
        });

        $scope.getLink=function(item){
            var link='';
            if(item.key=='NOTE'){
                link='#/task/note/'+item.task.id+(item.type!='deleted'?'?focusMe='+item.value.id:'');
            }
            else{
                if(item.type=='complete'){
                    link='#/task/closed?tasks='+item.task.id;
                }
                else if(item.key==dbEnums.keys.TASK_DELETE){
                    link='javascript:void(0)';
                }
                else{
                    link='#/task/edit/'+item.task.id+(item.type=="reopen"?"?type=reopen":"");
                }

            }


            return link;
        };

    }]);

}).call(this);
