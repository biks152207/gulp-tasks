(function (){
    app.controller('taskListController', function ($rootScope, $scope, $stateParams, $state, $timeout, sortService,
                                                    stringService, filterService,  sharedData, date,  taskService, taskListView, $ionicLoading,
                                                   labelService, project, dbEnums, settingsService, platformService,userModel,$ionicScrollDelegate,message,uiHelperService,asyncStackService,$q,$ionicLoading,$location,roleValidators) {
        var isUndo = false;
        $scope.showCompleted=false;
        $scope.noMoreCompletedItemsAvailable=false;
        $scope.completeListVisible=false;
        $scope.canSearchCompleted=false;
        $scope.isCompletedEnabled=true;
        $scope.searchingCompletedTasks=false;
        var loadMoreCompletedConfig={skip:0,limit:25};
        var isDefaultView;
        var completedTaskAsyncStacker=asyncStackService.createStacker();
        $scope.clicked = function (member, event) {
            //return;
            taskListView.clicked(member, $scope.type, event ? event.shiftKey||(window.fixes && window.fixes.shiftKey) : platformService.isMobileDevice());


            //console.log('------'+member.name+'-------');
            //console.log(member.recurrence);

        };


        $scope.complete = function (item,event, isMobile) {
            //event.preventDefault();
            event.stopPropagation();
            console.log('item status : '+item.name+'   '+item.status);
            var isItemUndo=item.status==dbEnums.status.complete;
            //isUndo=isItemUndo;
            if(isMobile){
                $timeout(function(){
                    if(!isUndo){
                        $rootScope.$emit('bulk-complete:response', false);
                    }
                    else{
                        //undoTaskComplete();
                    }
                    isUndo = false;
                }, 3000);

            } else{
                item.status =isItemUndo?dbEnums.status.active: dbEnums.status.complete;
            }

            if(isItemUndo){
                taskService.removeFromBulkCompleteList(item);
            }
            else{
                taskService.bulkCompleteRequest([item], isMobile)
                    .then(function(){
                        taskListView.clearAllSelected();
                    });
            }

        };

        $scope.getAll = function (type, object) {
            //console.log('getAll called');

            if($state.current.state==sharedData.STATE.CLOSED){
                //$scope.taskList = angular.isArray($rootScope.closedTask)?$rootScope.closedTask:[$rootScope.closedTask];
                //if($rootScope.closedTask)
                var allTaskIds=$stateParams.tasks?$stateParams.tasks.split(","):[];
                return taskService.getTasksByIds(allTaskIds).then(function(taskObjects) {

                    if(!taskObjects|| !taskObjects.length){
                        return taskService.getCompletedTasks({tasks:$stateParams.tasks})
                            .then(function(tasks){
                                //$timeout(function(){
                                //    $ionicLoading.hide();
                                //console.info('Total No of Tasks : ',tasks.length);
                                $scope.taskList=tasks;
                                $rootScope.$emit('task:header-taskList', $scope.type, tasks.length, $scope.object);
                                //$scope.isLoading=false;
                                // },6000);



                            },function(err){

                                $rootScope.$emit('toast-message', err.msg);
                            })
                            .finally(function(){

                            });
                    }
                    else{
                        $scope.taskList = taskObjects;
                        $rootScope.$emit('task:header-taskList', $scope.type, taskObjects.length, $scope.object);
                        $timeout(function(){
                            $rootScope.$emit('update-sticky');
                        },200);
                    }
                    //console.log('getAll complete');

                });

            }
            else{
                return taskService.getTasksByType(type, object).then(function(taskObjects){
                    $scope.taskList = taskObjects;
                    $rootScope.$emit('task:header-taskList', $scope.type, taskObjects.length, $scope.object);
                    $timeout(function(){
                        $rootScope.$emit('update-sticky');
                    },200);
                    //console.log('getAll complete');
                    //console.info('Total No of Tasks : ',taskObjects.length);
                });
            }

        };

        $scope.pull = function () {

           // $timeout(function(){


                var pullEventListener=$rootScope.$on('pull-from-server-complete',function(){

                   // $timeout(function(){
                        $scope.$broadcast('scroll.refreshComplete');
                        pullEventListener();
                   // },300);
                });
            $rootScope.$emit('pull-from-server');
           // },100);

        };

        $scope.redirectToEdit = function (id,task) {
            taskListView.setDefaultView();
            if(task && task.status==dbEnums.status.complete){
                $rootScope.closedTask=task;
            }
            else{
                delete $rootScope.closedTask;
            }
            $state.go('/task/edit', {id: id});

        };

        $scope.start = function () {

            isDefaultView = !!$stateParams.type;
            $scope.searchingCompletedTasks=false;
            switch($state.current.state){
                case sharedData.STATE.ASSIGNEE:
                    project.getUserFromAllProjects($stateParams.id).then(function(assignee){
                        if(assignee){
                           $scope.object = assignee;
                           $scope.type = $state.current.state;
                           $rootScope.title = assignee.displayName;
                           $scope.getAll($scope.type, $scope.object).then(flashMe);

                            loadMoreCompletedConfig['assignee']=$stateParams.id;
                            setCompleteListVisible(false,false);
                            //$scope.completeListVisible=true;
                            //taskListView.setSelectedFilterView(sharedData.STATE.ASSIGNEE);
                       }
                        else {
                            sharedData.home();
                        }
                    });
                    break;
                case sharedData.STATE.FILTER:

                    filterService.findById($stateParams.id).then(function(filter){
                        if(filter){
                            $scope.object = filter;
                            $scope.type = $state.current.state;
                            $rootScope.title = filter.name;
                            $scope.getAll($scope.type, $scope.object).then(flashMe);
                            //taskListView.setSelectedFilterView(sharedData.STATE.FILTER);

                        }
                        else {
                            sharedData.home();
                        }

                    });
                    break;
                case sharedData.STATE.LABEL:
                    labelService.findById($stateParams.id).then(function(label){
                        if(label){
                            $scope.object = label;
                            $scope.type = $state.current.state;
                            $rootScope.title = label.name;
                            $scope.getAll($scope.type, $scope.object).then(flashMe);
                            //taskListView.setSelectedFilterView(sharedData.STATE.LABEL);
                        }
                        else {
                            sharedData.home();
                        }

                    });
                    break;
                case sharedData.STATE.PROJECT:
                    project.findById($stateParams.id).then(function(tempProject){
                        if(tempProject){
                            $scope.object = tempProject;
                            $rootScope.title = tempProject.name;
                            $scope.type = $state.current.state;
                            $scope.getAll($scope.type, $scope.object)
                                .then(flashMe);
                            loadMoreCompletedConfig['project']=$stateParams.id;
                            //taskListView.setSelectedFilterView(sharedData.STATE.PROJECT);
                            setCompleteListVisible(true,false);
                            //$scope.completeListVisible=true;

                        }
                        else {
                            sharedData.home();
                        }

                    });
                    break;
                case sharedData.STATE.TASK:
                    $scope.object = null;
                    $scope.type = $stateParams.type;
                    $rootScope.$emit('left-menu:selected', $scope.type);
                    $rootScope.title = taskService.TASK_TYPE_NAME[$scope.type];
                    $scope.getAll($scope.type, $scope.object).then(flashMe);
                    //taskListView.setSelectedFilterView(sharedData.STATE.PROJECT);
                    break;
                case sharedData.STATE.CLOSED:
                    $scope.object = null;
                    $scope.type = "closed";
                    $rootScope.$emit('left-menu:selected', $scope.type);
                    $rootScope.title = taskService.TASK_TYPE_NAME[$scope.type];
                    $ionicLoading.show();
                    $scope.getAll($scope.type, $scope.object)
                        .finally(function(){
                            $ionicLoading.hide();
                        });
                    //taskListView.setSelectedFilterView(sharedData.STATE.PROJECT);
                    //$rootScope.$emit('task:header-taskList', $scope.type, $rootScope.closedTask.length, $scope.object);

                    //$scope.getAll($scope.type, $scope.object);
                    break;

            }

            //TODO: task_list_controller is being initialized on log off and this fix is temporary.
            if(userModel.isAuthenticated()){
                $scope.allFloatButtons = settingsService.getSettings().float_button ? parseInt(settingsService.getSettings().float_button.value) : null;
            }


            $scope.hasRightMenu = false;
            $scope.hasFooter = false;
            $scope.priorities = taskService.priorities;
            $rootScope.returnState = $state.current;
            $rootScope.returnParams = $stateParams;
            taskListView.clearAllSelected();

            //This time out is used to wait for the list to load
            $timeout(function(){

            },100);
        };

        function flashMe(){
            $timeout(function(){
                var focusedId=$location.search().focusMe;
                if(focusedId){
                    uiHelperService.focusTo(focusedId,$ionicScrollDelegate.$getByHandle('tasksScrollHandle'),{offsetTop:20});

                }
                else if($stateParams.focusedTaskId){
                    uiHelperService.focusTo($stateParams.focusedTaskId,$ionicScrollDelegate.$getByHandle('tasksScrollHandle'),{offsetTop:20});
                }
            },200);
        }

        $scope.taskAdd = function(){

            if($state.current.state == sharedData.STATE.PROJECT){
                taskService.addProjectToTaskObject($scope.object);
            }
            $state.go('/task/add');
        } ;

        $scope.undoTaskComplete = function(task){
            undoTaskComplete(task);
        };

        function undoTaskComplete(item){
            isUndo = true;
            taskService.removeFromBulkCompleteList(item);
            $rootScope.$emit('bulk-complete:response', isUndo);
        }

        if(userModel.isAuthenticated()){
            $scope.start();
        }


        var taskListListener;
        function subscribeListUpdate(){
            unSubscribeListUpdate();
            taskListListener = $rootScope.$on('taskList-update', function(){
                //taskListView.clearAllSelected();
                //$timeout(function(){
                $scope.getAll($scope.type, $scope.object);
                //});


            });
        }
        function unSubscribeListUpdate(){
            if(taskListListener){
                taskListListener();
                taskListListener=null;
            }
        }

        subscribeListUpdate();

        //var taskListListener = $rootScope.$on('taskList-update', function(){
        //    //taskListView.clearAllSelected();
        //    //$timeout(function(){
        //        $scope.getAll($scope.type, $scope.object);
        //    //});
        //
        //
        //});

        var taskFooterListener = $rootScope.$on('task-footer-toggle', function(){

            $scope.hasFooter = taskListView.isSelected();
        });

        var previousShowCompletedListFlag;
        var searchStartListener =  $rootScope.$on('search:start',function(event, startSearching){

            if(startSearching){
                previousShowCompletedListFlag=!!$scope.showCompleted;

                $scope.startSearching = startSearching;
                $scope.getAll(stringService.EMPTY);
                refreshSearchTaskComplete(true);
                console.log(startSearching);
                $ionicScrollDelegate.$getByHandle('tasksScrollHandle').scrollTo(0,0);

            }
            else{

                $timeout(function(){
                    $scope.showCompleted=previousShowCompletedListFlag;
                    previousShowCompletedListFlag=null;
                    $scope.startSearching = startSearching;
                    refreshSearchTaskComplete();
                },500);

                $scope.getAll($scope.type, $scope.object);
                $scope.searchText = {
                    name: stringService.EMPTY
                };
                console.log(startSearching);
            }

        });

        var searchTaskListener =  $rootScope.$on('search:tasks',function(event, searchText){

            $scope.searchText = {
                    name: searchText
            };
            console.log('search text: ',searchText);
            console.log('startSearching: ',$scope.startSearching);

            refreshSearchTaskComplete();

        });

        var sortTaskListener = $rootScope.$on('task:list-sorted', function(event){
            $scope.getAll($scope.type, $scope.object);

        });

        var stateChangeStartListener=$rootScope.$on("$stateChangeStart",function(){
            $rootScope.$emit('left-menu:selected',  null);
        });


        $scope.$on('$destroy', function(){
            unSubscribeListUpdate();
            taskFooterListener();
            searchTaskListener();
            searchStartListener();
            sortTaskListener();
            completedTaskAsyncStacker.clear();
            sortOrderListener();
            taskCompleteListener();
            taskReopenListener();
            stateChangeStartListener();
        });
        $scope.clearRecentTask=function(){
            console.log('unsetting recentTaskId');
            $rootScope.recentTaskId=undefined;
            console.log('unset recentTaskId');
        };


        function getCompletedTasks() {

            var opt = {};
            opt = angular.extend(opt, loadMoreCompletedConfig);
            if(!$scope.canSearchCompleted){
                opt.limit=10;
            }
            console.log(JSON.stringify($scope.searchText));
            if ($scope.startSearching ) {
                if(!$scope.searchText || $scope.searchText.name==stringService.EMPTY){
                    console.log('cancelling search completed load');
                    var defer=$q.defer();
                    $scope.completedLists=[];
                    loadMoreCompletedConfig.skip=0;
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    defer.reject();
                    return defer.promise;
                }

                opt.filter = $scope.searchText;

            }

            if($scope.startSearching){
                delete opt.project;

            }
            console.log(JSON.stringify(opt));

            $scope.searchingCompletedTasks = true;
            return taskService.getCompletedTasks(opt)
                .then(function (data) {

                    data = data || [];
                    data.forEach(function (task) {
                        if (true) {

                            task.due = date.getDateOnly(task.recurrence.due_date) || new Date('01-01-2050');
                            task.recurrence.due_time = date.getTime(task.recurrence.due_date);
                            task.isOverdued = date.isPastDay(task.recurrence.due_date);
                            task.assignee = taskService.getAssignee(task);
                            task.isComplete = task.status === "complete";
                            //tsks.push(task);
                        }
                    });
                    if (data.length > 0) {
                        $scope.completedLists = $scope.completedLists.concat(data);
                        loadMoreCompletedConfig.skip += data.length;
                        $scope.noMoreCompletedItemsAvailable = false;

                    }
                    else {
                        $scope.noMoreCompletedItemsAvailable = true;
                    }
                    $timeout(function () {
                        $scope.searchingCompletedTasks = false;
                        $ionicScrollDelegate.resize();

                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        if (data.length > 0) {
                            uiHelperService.scrollTo(data[0].id, $ionicScrollDelegate.$getByHandle('tasksScrollHandle'), {
                                offsetTop: 100,
                                animate: true
                            },function(){});

                        }

                    }, 200);


                    //$ionicScrollDelegate.scrollBottom();

                }, function (err) {
                    $scope.searchingCompletedTasks = false;
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    if(err.msg){
                        $rootScope.$emit('toast-message', err.msg);
                    }

                    //console.log(err);
                })
                .finally(function(){

                });
        }

        $scope.loadMoreCompleted=function(type){
            //if(type && type==='infinite' && $scope.searchingCompletedTasks){
            //    $scope.$broadcast('scroll.infiniteScrollComplete');
            //    return ;
            //}


            var a=completedTaskAsyncStacker.stack(getCompletedTasks,[],this);
            a.promise.then(function(){
                console.log('load more');
            });


        };

        $scope.$watch('showCompleted',function(newVal,oldVal){

            console.log('showCompleted change : '+newVal);
           if(newVal===oldVal){
               return;
           }
            if(newVal===false){
                $scope.completedLists=[];
                $scope.noMoreCompletedItemsAvailable=false;
                loadMoreCompletedConfig.skip=0;
            }
            else if(newVal){
                //$ionicScrollDelegate.$getByHandle('tasksScrollHandle').scrollBottom();
                refreshTaskComplete();
            }



        });

        $scope.showHideCompleted=function(newVal){
            $scope.showCompleted=!$scope.showCompleted;
        }

        var taskCompleteListener=$rootScope.$on('task-complete',function(){
            refreshTaskComplete();
           // $scope.noMoreCompletedItemsAvailable=false;

        });

        $scope.unCompleteTask=function(task){
            console.log(task.status);

            //return;
            $ionicLoading.show();
            taskService.unCompleteTasks(task)
                .then(function(tasks){

                    $rootScope.$emit('toast-message', message.successMessages.TASK_UNCOMPLETED);
                    $rootScope.$emit('pull-from-server');
                    if(isDefaultView){
                        taskListView.setDefaultView();
                    }
                    sharedData.taskHome(tasks[0],tasks[0].id);

                },function(err){
                    if(err && err.msg){
                        $rootScope.$emit('toast-message', err.msg);
                    }
                    task.status=dbEnums.status.complete;

                    //console.log(err);
                })
                .finally(function(){
                    $ionicLoading.hide();
                });
        }

        var taskReopenListener=$rootScope.$on('task-reopen',function(event,tasks){
            //console.log('tasks reopened');
            //console.log(tasks);
            tasks=tasks||[];
            tasks.forEach(function(task){
                $scope.completedLists.forEach(function(cTask,idx){
                    if(cTask.id==task.id){
                        $scope.completedLists.splice(idx,1);
                        $timeout(function(){
                            console.log('focusing on task '+task.id);
                            uiHelperService.focusTo(task.id,$ionicScrollDelegate.$getByHandle('tasksScrollHandle'),{offsetTop:20,focusMeBackgroundSelector:'.item-content'});
                        },300);



                        return false;
                    }
                });
            });
        });

        function refreshTaskComplete(skipSearch){

            function func() {
                if ($scope.showCompleted) {
                    $scope.searchingCompletedTasks = false;
                    $scope.noMoreCompletedItemsAvailable = false;
                    loadMoreCompletedConfig.skip = 0;
                    $scope.completedLists = [];
                    $ionicScrollDelegate.resize();
                    console.info('skip search : ',skipSearch);
                    if(!$scope.isCompletedEnabled ||($scope.startSearching && !$scope.canSearchCompleted)){
                        return false;

                    }
                    else{
                        return getCompletedTasks();
                    }

                    //if(skipSearch){
                    //    return false;
                    //}
                    //else{
                    //    return getCompletedTasks();
                    //}

                }
            }

            var a=completedTaskAsyncStacker.stack(func);
            a.promise.then(function(){
               //console.log('refreshtask');
            });

        }

        function refreshSearchTaskComplete(){
            //if(canSearchCompleted){
            //    refreshTaskComplete();
            //}
            var user=userModel.getLoggedInUser();

            roleValidators.checkUserRole(user,dbEnums.USER_ROLES.SEARCH,{},false)
                .then(function(){
                    refreshTaskComplete(false);
                },function(){
                    refreshTaskComplete(true);
                });

        }
        
        $scope.completedLists=[];

        $scope.onReorder=function($fromIndex, $toIndex,$closestIndex){
            var defer=$q.defer();
            //return;

          console.log(arguments);
            //return;
            //debugger;
            var taskNames=getTaskNames($scope.taskList);
            console.log('--------old list-------');
            console.log(taskNames.join(','));

            //return;
            userModel.get(function(user){
                var sortType = sortService.getSortType() ;
                var order =  sortService.getOrder().value;
                var newList=angular.copy($scope.taskList);

                unSubscribeListUpdate();
                //unSubscribeOrderLister();
                taskService.moveTask(newList,$fromIndex,$toIndex,$closestIndex,user,sortType.showDateBar,sortType,order)
                    .then(function(result){
                       // console.log('step 6');
                        result=result||{};
                        var resultList=result.tasks;
                        if(resultList){
                            _.each(resultList,function(task){
                               taskService.setTaskProps(task);
                            });


                            if(result.requireSort){
                                resultList=taskService.sortTasks(resultList,sortType,order,user);
                            }


                            $scope.taskList=resultList;


                            console.log('--------New list-------');
                            taskNames=getTaskNames(resultList);
                            console.log(taskNames.join(','));
                            defer.resolve();
                              //  $scope.taskList=newList;

                        }
                        else{
                            //newList=taskService.sortTasks($scope.taskList,sortType,order,user);
                            //$scope.taskList=newList;
                            defer.reject();
                        }



                    },defer.reject)
                    .finally(function(){
                        subscribeListUpdate();
                        //subscribeOrderListener();
                    });

            });

            return defer.promise;

        };

        function getTaskNames(tasks){
            var taskNames=[];
            tasks.forEach(function(task){
                taskNames.push(task.name);
            });
            return taskNames;
        }

        //var tsks=[];
        $scope.completedLists.forEach(function(task){
            if (true) {

                task.due = date.getDateOnly(task.recurrence.due_date) || new Date('01-01-2050');
                task.recurrence.due_time = date.getTime(task.recurrence.due_date);
                task.isOverdued = date.isPastDay(task.recurrence.due_date);
                task.assignee = taskService.getAssignee(task);
                //tsks.push(task);
            }
        });

        $scope.checkScrolling=function(){
            console.info('scrolling');
            if(window.cordova && cordova.plugins && cordova.plugins.Keyboard){
                cordova.plugins.Keyboard.close();
            }
        }
        //$scope.completedLists=tsks;

        var sortOrderListener;
        function subscribeOrderListener(){
            unSubscribeOrderLister();
            sortOrderListener=$rootScope.$on('userInfo-sortOrder',function(){

                $scope.getAll($scope.type, $scope.object);
            });
        }
        function unSubscribeOrderLister(){
            if(sortOrderListener){
                sortOrderListener();
                sortOrderListener=null;
            }
        }

        subscribeOrderListener();

        function setCompleteListVisible(isCompletedEnabled,showWarning){
            $scope.completeListVisible=true;

            var user=userModel.getLoggedInUser();
            roleValidators.checkUserRole(user,dbEnums.USER_ROLES.SEARCH,{},showWarning)
                .then(function(){
                    $scope.canSearchCompleted=true;
                    if(isCompletedEnabled){
                        $scope.isCompletedEnabled=true;
                    }
                    //$scope.isCompletedEnabled=true;
                },function(){
                    if(!isCompletedEnabled){
                        $scope.isCompletedEnabled=false;
                    }
                    //$scope.isCompletedEnabled=false;
                });
        }
    });

}).call(this);
