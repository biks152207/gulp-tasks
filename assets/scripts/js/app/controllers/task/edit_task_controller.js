(function () {
    app.controller('editTaskController', function ($q, $rootScope, $scope, $state, $ionicModal, $stateParams, $timeout, toastr, connectivity,
                                                   taskService, dueService, labelService, stringService, headerService, reminderService, historyService,
                                                   sharedData, project, user, date, dbEnums, message, $ionicPopup, userModel, taskListView,
                                                   popupService,$ionicTabsDelegate,$ionicLoading,uiHelperService,$ionicScrollDelegate,navigationService,roleValidators,settingsService) {
        var skip, limit, taskId, isDefaultView, prevTask,saving;
        var discarded = false;
        var saving=
        $scope.histories = [];
        $scope.canSeeHistory=true;
        $scope.licenseError={};
        skip = 0;
        limit = 20;

        $scope.dropdowns = {
            watchers: false,
            labels: false,
            reminders: true
        } ;
        $scope.isEmailEnabled=false;

        $scope.defaultReminderChannels=null;

        function isWatcherExists(watcher){
            var checked = false;
            if($scope.taskObject.watchers){
                $scope.taskObject.watchers.forEach(function(object){
                    if(object.watcher._id === watcher._id) {
                        checked = object.checked;
                    }
                })
            }
            return checked;
        }

        function initAssignee(){
            $scope.taskObject.assignee = taskService.getAssignee($scope.taskObject) || {};
        }

        function initWatchers(){
            var watchers = [];

            $scope.taskObject.users.forEach(function(watcher){
                if(watcher.role !== dbEnums.taskUserRole.assignee){
                    watchers.push({
                        checked: watcher.getNotification,
                        watcher: watcher
                    })
                }
            });
            watchers = userModel.meTopOnList(watchers, 'watcher');
            $scope.taskObject.watchers = angular.copy(watchers);

        }

        function setLabels(){
            $scope.taskObject.labels = [];
            labelService.getAll().then(function(labels){
                if(labels){
                    labels.forEach(function (label){

                        $scope.taskObject.labels.push({
                            checked : labelService.isTaskExists(taskId, label),
                            label : label
                        });
                    });
                }

            });

        }

        function setProjects(){
            project.getAll().then(function(projects){
                if(projects) {
                    projects.splice(0, 0, sharedData.inbox);
                    $scope.projects = projects;
                }
            });
        }

        function setReminderList(){
            var scheduleTime ;
            $scope.taskObject.reminders.forEach(function(reminder){

                reminder.date_created = new Date(reminder.date_created);
                scheduleTime = reminderService.getScheduledTime(reminder, $scope.taskObject.recurrence.due_date);
                reminder.invalid = date.isPast(scheduleTime) || ($scope.taskObject.recurrence.due_date && date.isAfter(scheduleTime, $scope.taskObject.recurrence.due_date));
                if(reminder.time.id == 1) reminder.time.title = date.getDateTime(reminder.time.value);

            });
        }


        $scope.taskComplete = function(){
            var returnState = {
                name: $state.current.name,
                params:{ id: taskId}
            };
            taskService.bulkCompleteRequest([$scope.taskObject], false, returnState);
            if(isDefaultView) taskListView.setDefaultView();
            sharedData.home();
        };

        $scope.setFavourites = function(){

            var data = {
                isFavourite  : !$scope.isFavourite,
                taskIds      : [$scope.taskObject.id]
            };
            taskService.bulkFavourites(data).then(function(isFavourite){
                if(isFavourite) $rootScope.$emit('toast-message', message.successMessages.TASK_ADD_TO_FAVOURITE);
                else $rootScope.$emit('toast-message', message.successMessages.TASK_REMOVE_FROM_FAVOURITE);
                $scope.isFavourite = isFavourite;
            });
        };

        $scope.toggleMenu = function (key) {
            $scope.dropdowns[key] = !$scope.dropdowns[key];
        };

        $scope.setAssignees = function(){

            var defer = $q.defer();
            $scope.assignees = [];

            if($scope.taskObject.project.id){
                project.findById($scope.taskObject.project.id).then(function(taskProject){
                    taskProject.users.forEach(function(assignee){
                        if(assignee.status === dbEnums.status.active) $scope.assignees.push(assignee);
                    });
                    $scope.assignees = userModel.meTopOnList($scope.assignees);
                    $scope.assignees.unshift({
                        _id: 0,
                        displayName: 'Unassigned'
                    });
                    defer.resolve($scope.assignees);
                });

            }
            else{
                $scope.assignees.push({
                    _id: 0,
                    displayName: 'Unassigned'
                });
                defer.resolve($scope.assignees);
            }
            return defer.promise;
        };

        $scope.setReminders = function(isProjectChanged, isDueDateChanged){

            var reminders = [];
            var reminderList = angular.copy($scope.taskObject.reminders);

            if(reminderList.length){
                if(isProjectChanged){

                    $scope.prevReminders.forEach(function(tReminder){
                        if(!_.some($scope.taskObject.reminders, tReminder)){
                            //retrieve the stored reminder after changing the project
                            reminderList.push(tReminder);
                        }
                    });
                    var assignees = angular.copy($scope.assignees);
                    assignees.splice(0, 1); //Remove Unassigned

                    reminderList.forEach(function(prevReminder){

                        if(assignees.length){
                            for(var i =0; i < assignees.length; i++ ){
                                if(prevReminder.assignee._id == assignees[i]._id){
                                    reminders.push(prevReminder);
                                    break;
                                }
                            }
                        }
                        else if(prevReminder.assignee._id == userModel.getLoggedInId()){ // Inbox
                            reminders.push(prevReminder);
                        }
                    });

                }
                else if(isDueDateChanged){
                    reminderList.forEach(function(prevReminder){
                        if(prevReminder.time.id || (!prevReminder.time.id && $scope.taskObject.recurrence.due_date)){
                            reminders.push(prevReminder);
                        }
                    });

                }
                $scope.taskObject.reminders = angular.copy(reminders);
                setReminderList();
            }


        };


        $scope.setWatchers = function(updated,callback){
            var watchers = [];

            if(!$scope.taskObject.watchers.length || updated ){

                if($scope.taskObject.project.id){

                    project.findById($scope.taskObject.project.id).then(function(taskProject){

                        taskProject.users.forEach(function (watcher){
                            if($scope.taskObject.assignee._id !== watcher._id && watcher.status === dbEnums.status.active){
                                watchers.push({
                                    checked : isWatcherExists(watcher),
                                    watcher : watcher
                                });
                            }

                        });
                        watchers = userModel.meTopOnList(watchers, 'watcher');
                        $scope.taskObject.watchers = angular.copy(watchers);
                        if(callback){
                            callback();
                        }


                    });


                }
                else{
                    $scope.taskObject.watchers = angular.copy(watchers);
                    if(callback){
                        callback();
                    }
                }
            }

        };


        $scope.setDueDate = function(){

            $scope.taskObject.recurrence = {};
            $scope.taskObject.hasDueDate = true;
            $scope.dueDateSummary = stringService.EMPTY;
            $scope.setReminders(false, true);
        };

        $scope.createModals = function(){

            $ionicModal.fromTemplateUrl('html/views/modals/tasks/projects.html', function ($ionicModal) {
                $scope.projectModal = $ionicModal;
            }, {
                scope: $scope,
                animation: 'scale-in'
            });
            $ionicModal.fromTemplateUrl('html/views/modals/tasks/assignees.html', function ($ionicModal) {
                $scope.userModal = $ionicModal;
            }, {
                scope: $scope,
                animation: 'scale-in'
            });
            $ionicModal.fromTemplateUrl('html/views/modals/tasks/priorities.html', function ($ionicModal) {
                $scope.priorityModal = $ionicModal;
            }, {
                scope: $scope,
                animation: 'scale-in'
            });
            $ionicModal.fromTemplateUrl('html/views/modals/tasks/due_date.html', function ($ionicModal) {
                $scope.dueDateModal = $ionicModal;
            }, {
                scope: $scope,
                animation: 'scale-in'
            });
        };

        $scope.updateProject = function (project,force) {

            var projectChanged = $scope.taskObject.project.id != project.id;
            var taskObjectChanged=false;
            if(prevTask!==undefined && !angular.equals(prevTask, $scope.taskObject) && ($rootScope.rightDefaultViewVisible)){
                taskObjectChanged=true;
            }

            $scope.taskObject.project = {
                id: project.id,
                name: project.name,
                color: project.color
            };

            if(projectChanged || force) {


                $scope.taskObject.assignee = {};
                $scope.setAssignees().then(function(){
                    $scope.setReminders(true, false);
                    $scope.setWatchers(true,function(){
                        if(force && !taskObjectChanged){
                            prevTask=$scope.taskObject;
                        }
                    });
                });



            }

        };

        $scope.updateAssignee = function (assignee) {

            $scope.taskObject.assignee = {
                _id: assignee._id,
                displayName: assignee.displayName,
                displayShortName: assignee.displayShortName,
                email: assignee.email,
                avatar: assignee.avatar
            };
            $scope.setWatchers(true);
        };

        $scope.updatePriority = function (key) {

            $scope.taskObject.priority = key;

        };

        $scope.updateDueDate = function(key){
            var prevTime=$scope.taskObject.recurrence.due_date?new Date($scope.taskObject.recurrence.due_date):null;
            switch(key){
                case  "TODAY":
                    $scope.taskObject.recurrence = {
                        due_date : date.getDateOnly(date.today())
                    };
                    break;
                case  "TOMORROW":
                    $scope.taskObject.recurrence = {
                        due_date : date.getDateOnly(date.tomorrow())
                    };

                    break;
                case  "WEEK":
                    $scope.taskObject.recurrence = {
                        due_date : date.getDateOnly(date.nextWeek())
                    };
                    break;
                case  "MONTH":
                    $scope.taskObject.recurrence = {
                        due_date : date.getDateOnly(date.nextMonth())
                    };
                    break;
                case "NO_DATE":
                    $scope.dueDateModal.show();
                    break;
                case "CUSTOM_DATE":
                    $scope.taskObject.recurrence = {
                        due_date : $scope.taskObject.recurrence.due_date // clearing other recurrence props set during recurrence
                    };
                    break;

            }
            if(key!='NO_DATE'){

                $scope.taskObject.hasDueDate = true;
                if($scope.taskObject.recurrence && $scope.taskObject.recurrence.due_date){
                    $scope.taskObject.recurrence.due_date=new Date($scope.taskObject.recurrence.due_date);
                    if(prevTime && key!=='CUSTOM_DATE'){
                        $scope.taskObject.recurrence.due_date.setHours(prevTime.getHours());
                        $scope.taskObject.recurrence.due_date.setMinutes(prevTime.getMinutes());
                        $scope.taskObject.recurrence.due_date.setSeconds(prevTime.getSeconds());
                        $scope.taskObject.recurrence.due_date.setMilliseconds(prevTime.getMilliseconds());
                    }
                }

                $scope.dueDateSummary = dueService.getSummary($scope.taskObject.recurrence);
                $scope.setReminders(false, true);
            }


        };

        $scope.addReminder = function(newReminder){

            if(newReminder){

                $scope.taskObject.reminders.push($scope.reminderObject);
                $scope.dropdowns.reminders = true;
                setReminderList();

            }
            $scope.reminderObject = {};

        };

        $scope.removeReminder = function (id) {

            var infoMsg = message.infoMessages.REMINDER_DELETE_CONFIRMATION;
            $ionicPopup.show({
                title: infoMsg.title,
                template: infoMsg.message,
                scope: $scope,
                buttons: [{
                    text: stringService.NO,
                    onTap: function () {
                        return true;
                    }
                },
                    {
                        text: stringService.YES,
                        onTap: function () {
                            for(var i=0; i < $scope.taskObject.reminders.length; i++){
                                if($scope.taskObject.reminders[i].id == id){
                                    $scope.taskObject.removeReminders.push(id);
                                    $scope.taskObject.reminders.splice(i, 1);
                                    setReminderList();
                                    break;
                                }
                            }
                        }
                    }]
            });

        };

        $scope.getRecurrenceModel = function (model) {

            if (model){
                $scope.recurrence = model;
                $scope.taskObject.hasDueDate = true;
                $scope.taskObject.recurrence = dueService.setDueDate($scope.taskObject.recurrence);
                $scope.dueDateSummary = dueService.getSummary($scope.taskObject.recurrence);
                $scope.setReminders(false, true);
            }
            else $scope.dueDateModal.show();

        };

        $scope.saveKeyEnter = function(event){
            if(event.keyCode == 13){
                $scope.save();
            }
        }

        $scope.tabFocus = function (event) {
            if(event.keyCode == 13){
                if(event.target.tabIndex == 2){ // Project Modal
                    $scope.projectModal.show()
                }
                else if(event.target.tabIndex == 3){ // User Modal
                    $scope.userModal.show()
                }
                else if(event.target.tabIndex == 4){ // Watchers
                    $scope.toggleMenu("watchers");
                }
                else if(event.target.tabIndex == 5){ // Priority
                    $scope.priorityModal.show()
                }
                else if(event.target.tabIndex == 6){ // Labels
                    $scope.toggleMenu("labels");
                }
                else if(event.target.tabIndex == 7){ // Due Date Modal
                    $scope.dueDateModal.show()
                }
                else if(event.target.tabIndex == 8){ // Reminders
                    $scope.toggleMenu("reminders");
                }
            }
        }

        $scope.save = function () {
            $scope.form.$submitted = true;
            if($scope.form.$valid){

                taskService.update($scope.taskObject, prevTask).then(function(results){
                    if(results){
                        $rootScope.$emit('toast-message', message.successMessages.TASK_EDITED);

                    }
                    saving=true;
                    if(isDefaultView){
                        //taskListView.setDefaultView();
                        taskListView.clearAllSelected();
                        $timeout(function(){
                            uiHelperService.focusTo($scope.taskObject.id,$ionicScrollDelegate.$getByHandle('tasksScrollHandle'),{offsetTop:20});
                        });

                        return;
                    }

                    navigationService.goBack({focusedTaskId:$scope.taskObject.id});

                    //sharedData.taskHome($scope.taskObject,$scope.taskObject.id);

                });

            }

        };


        $scope.discardPopup = function (toState, toParams) {

            popupService.discard($rootScope)
                .then(function(result){
                    if(result){
                        discarded = true;
                        taskService.clearTaskObject();
                        if( $scope.projectModal)     $scope.projectModal.remove();
                        if( $scope.userModal)        $scope.userModal.remove();
                        if( $scope.priorityModal)    $scope.priorityModal.remove();
                        if( $scope.dueDateModal)   $scope.dueDateModal.remove();
                        taskListView.setDefaultView();
                        $state.go(toState.name, toParams);
                    }
                    else{
                        return true;
                    }
                });

            //$ionicPopup.show({
            //    template: message.infoMessages.DISCARD_CHANGE.message,
            //    title: message.infoMessages.DISCARD_CHANGE.title,
            //    scope: $scope,
            //    buttons: [{
            //        text: stringService.NO,
            //        onTap: function () {
            //            return true;
            //        }
            //    },
            //        {
            //            text: stringService.YES,
            //            onTap: function () {
            //                discarded = true;
            //                taskService.clearTaskObject();
            //                if( $scope.projectModal)     $scope.projectModal.remove();
            //                if( $scope.userModal)        $scope.userModal.remove();
            //                if( $scope.priorityModal)    $scope.priorityModal.remove();
            //                if( $scope.dueDateModal)   $scope.dueDateModal.remove();
            //                taskListView.setDefaultView();
            //                $state.go(toState.name, toParams);
            //            }
            //        }]
            //});
        };

        $scope.start = function() {

            saving=false;
            isDefaultView = !!$stateParams.type;
            taskId =  $stateParams.id;
            if(!isDefaultView){
                $scope.title = 'Edit Task';
                $scope.addUrl = '#/task/edit/'+taskId;
                $scope.noteUrl = '#/task/note/'+taskId;
            }

            var settings=settingsService.getSettings();
            $scope.defaultReminderChannels=settings.reminder.taskCreateReminderNotificationChannels;

            var user=userModel.getLoggedInUser();
            roleValidators.checkUserRole(user,dbEnums.USER_ROLES.EMAIL_NOTIFICATIONS,{},false)
                .then(function(){
                    $scope.isEmailEnabled=true;
                });

            roleValidators.checkUserRole(user,dbEnums.USER_ROLES.TASK_HISTORY,{},false)
                .then(function(){

                },function(err){
                        $scope.canSeeHistory=false;
                        $scope.licenseError=message.infoMessages['TASK_HISTORY'];
                });

            function initTask(task){
                if(task){

                    $scope.createModals();
                    $scope.taskObject = task;
                    $scope.disableModification=task.status==dbEnums.status.complete;
                    $scope.taskObject.removeReminders = [];
                    $scope.reminderObject = {};
                    setProjects();
                    initAssignee();
                    $scope.setAssignees();
                    initWatchers();
                    setLabels();
                    setReminderList();
                    //store current recurrence to check if there's any change after edit
                    $scope.taskObject.prevRecurrence = angular.copy(task.recurrence);
                    $scope.prevReminders = angular.copy(task.reminders);
                    $scope.dueDateSummary = dueService.getSummary($scope.taskObject.recurrence);
                    $scope.priorities = taskService.priorities;
                    $scope.loginId = userModel.getLoggedInId();

                    if(!isDefaultView){
                        headerService.setEditTaskHeader($scope,taskId);
                        $rootScope.$emit('task:header',$state.current.state, task);
                        $scope.date_created = date.getDateTime($scope.taskObject.date_created);
                    }
                    else {

                        $rootScope.$emit('list:header-scope',$scope);
                    }

                    $scope.isFavourite = taskService.isFavourite($scope.taskObject, $scope.loginId);

                    //skip = 0;
                    //limit = 20;

                    //TODO: need to fix this. Somwhere $scope.taskObject is being changed. Slower mobile app seems to trigger this timer before the change happens elsewhere.

                    $timeout(function(){
                        $scope.taskObject.prevRecurrence = angular.copy(task.recurrence);
                        prevTask = angular.copy($scope.taskObject);

                        if($stateParams.showType && $stateParams.showType=='reopen'){
                            $ionicLoading.hide();
                        }

                    }, 800);


                }
                else{
                    sharedData.home();
                }
            }


           // else{
            if($stateParams.showType && $stateParams.showType=='reopen'){
                $ionicLoading.show();
            }
            taskService.findActiveTaskById(taskId).then(function(task){
                if(!task){
                    if(!$rootScope.closedTask){

                        taskService.getTaskFromServer(taskId)
                            .then(function(task){
                                if(task){
                                    initTask(task);
                                }

                                else {
                                    $rootScope.$emit('toast-message', message.errorMessages.TASK_NOT_FOUND);

                                }
                            },function(err){
                                $rootScope.$emit('toast-message', err.msg);
                            });
                    }
                    else{
                        initTask($rootScope.closedTask);
                    }


                }
                else{
                    initTask(task);
                }


            });
           // }//
        };

        $scope.start();

        $scope.$on('$stateChangeStart', function (event, toState, toParams) {


            if(!discarded && !saving && prevTask && !angular.equals(prevTask, $scope.taskObject) && (true)){
                event.preventDefault();
                $scope.discardPopup(toState, toParams);
            }
            else{
                if( $scope.projectModal)     $scope.projectModal.remove();
                if( $scope.userModal)        $scope.userModal.remove();
                if( $scope.priorityModal)    $scope.priorityModal.remove();
                if( $scope.dueDateModal)   $scope.dueDateModal.remove();
                taskListView.setDefaultView();
            }


        });

        function beforeSwitch(event){
            if(prevTask!==undefined && !angular.equals(prevTask, $scope.taskObject) && ($rootScope.rightDefaultViewVisible)){
                event.preventDefault();

            }
        }

        $scope.$on('beforeTaskListSelectionChange', function (event, item,type,multiSelectEnable) {

            beforeSwitch(event);

        });



        $scope.loadMore = function() {

            if(connectivity.isConnected()){
                historyService.getHistoriesByTaskId(taskId, skip, limit).then(function(results){

                    if(results.length){
                        results.forEach(function(item){
                            item.icon  = sharedData.EVENT_ICONS[item.key];
                            if(item.type==dbEnums.status.reopened){
                                item.icon=sharedData.EVENT_ICONS[item.type.toUpperCase()];
                            }
                            item.date_modified = date.getDateTime(item.date_modified);
                            $scope.histories.push(item);
                        });
                        skip +=limit;
                    }
                    else  $scope.noMoreItemsAvailable = true;

                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });

            }
            else{
                $scope.noMoreItemsAvailable = true;
            }

        };

        var taskFavouriteListener = $rootScope.$on('task:update-favourite', function(event, isFavourite){
            $scope.isFavourite = isFavourite;
        });

        $scope.$on('default:tabswitch', function(event){
            beforeSwitch(event);
            if(event.defaultPrevented){
                event.promise=popupService.discard($rootScope);
                event.promise.then(function(discard){
                     discarded=discard;
                })

            }
        });

        $scope.$on('$destroy', function(){
            taskFavouriteListener();
            projectListListener();

        });

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
            //$rootScope.default.edit = !index;
        }

        var projectListListener=$rootScope.$on('projectList-update',function() {

            if ($scope.taskObject.project.id) {

                project.findById($scope.taskObject.project.id).then(function (taskProject) {
                    if (taskProject) {
                        $scope.updateProject(taskProject, true);
                    }
                });
            }
        });

        $scope.selectLabel=function($event,label){

            var user=userModel.getLoggedInUser();
            //$event.preventDefault();
            console.log('label '+label.label.name +' : '+label.checked);
            if(label.checked){
                //checking the label
                //var changedLabel=angular.copy(label);
                //changedLabel.checked=true;
                roleValidators.checkUserRole(user,dbEnums.USER_ROLES.LABELS_ASSIGN,{labels:[label],task:$scope.taskObject},true)
                    .then(function(){


                    },function(err){
                        $timeout(function(){
                            label.checked=!label.checked;
                        });
                    });
            }
            else{
                //label.checked=!label.checked;
            }



        };

        $scope.copyTask=function(task){

            taskService.copyTask(task)
                .then(function(newTask){
                    taskService.setTaskObject(newTask);
                   $state.go('/task/add');
                });
        }

    });

}).call(this);
