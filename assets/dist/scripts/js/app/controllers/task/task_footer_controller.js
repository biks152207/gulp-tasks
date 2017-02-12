(function () {
    app.controller('taskFooterController', ["$rootScope", "$state", "$scope", "$ionicPopup", "$ionicModal", "$timeout", "$ionicPopover", "stringService", "message", "taskListView", "taskService", "rightMenuService", "date", "dbEnums", "$ionicLoading", "sharedData", function ($rootScope, $state, $scope,$ionicPopup, $ionicModal, $timeout, $ionicPopover,
                                                     stringService, message, taskListView, taskService, rightMenuService, date,dbEnums,$ionicLoading,sharedData) {

        var footer = $scope;

        function bulkDueDateUpdate(preservePreviousTime,preservePreviousDate){

            var data = {
                recurrence  : footer.taskObject.recurrence,
                taskIds      : taskListView.getTaskIds()
            };
            taskService.bulkDueDateUpdate(data,preservePreviousTime,preservePreviousDate).then(function(){
                $rootScope.$emit('toast-message', message.successMessages.TASK_DUE_DATE_UPDATED);
                taskListView.clearAllSelected();
            });
        }

        function createPopover(){

            footer.menus = rightMenuService.getBottomMenu();
            $ionicPopover.fromTemplateUrl('html/views/popovers/bottom_right_popover.html', {
                scope: footer,
                animation:'slide-in-right'
            }).then(function (popover) {
                footer.popover = popover;
            });

        }

        footer.toggleMenu = function () {
            return $scope.showMenu = !$scope.showMenu;
        };

        footer.bulkFavourites = function(){

            var data = {
             isFavourite  : !footer.isFavourite,
             taskIds      : taskListView.getTaskIds()
             };
            taskService.bulkFavourites(data).then(function(isFavourite){
                if(isFavourite) $rootScope.$emit('toast-message', message.successMessages.TASK_ADD_TO_FAVOURITE);
                else $rootScope.$emit('toast-message', message.successMessages.TASK_REMOVE_FROM_FAVOURITE);
                //taskListView.clearAllSelected();
            });
        };

        footer.bulkComplete = function(){

            taskService.bulkCompleteRequest(taskListView.getSelected())
                .then(function(){
                    taskListView.clearAllSelected();
                });

        };


        footer.delete = function() {

            //footer.toggleMenu();
            $ionicPopup.show({
                title: message.infoMessages.TASK_DELETE_CONFIRMATION.title,
                template: message.infoMessages.TASK_DELETE_CONFIRMATION.message,
                scope: footer,
                buttons: [{
                    text: stringService.NO,
                    onTap: function () {
                        return true;
                    }
                },
                    {
                        text: stringService.YES,
                        onTap: function () {
                            var tasks=taskListView.getSelected();
                            if(tasks.length>0){
                                taskService.delete(tasks,function(){
                                    taskListView.clearAllSelected();
                                    $rootScope.$emit('toast-message', message.successMessages.TASK_DELETED);
                                });
                            }


                            return true;

                        }
                    }]
            });

        };

        footer.openModal = function(){

            footer.taskObject = {
                recurrence : {}
            };
            footer.dueDateModal.show();
        };

        footer.updateDueDate = function(key,fieldsChanged){
            fieldsChanged=fieldsChanged||{date:false,time:false};
            switch(key){
                case  "TODAY":
                    $scope.taskObject.recurrence = {
                        due_date : date.getDateOnly(date.today())
                    };
                    fieldsChanged.date=true;
                    break;
                case  "TOMORROW":
                    $scope.taskObject.recurrence = {
                        due_date : date.getDateOnly(date.tomorrow())
                    };
                    fieldsChanged.date=true;
                    break;
                case  "WEEK":
                    $scope.taskObject.recurrence = {
                        due_date : date.getDateOnly(date.nextWeek())
                    };
                    fieldsChanged.date=true;
                    break;
                case  "MONTH":
                    $scope.taskObject.recurrence = {
                        due_date : date.getDateOnly(date.nextMonth())
                    };
                    fieldsChanged.date=true;
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

           if(key !== "NO_DATE") bulkDueDateUpdate(!fieldsChanged.time,!fieldsChanged.date);
        };

        footer.getRecurrenceModel = function (model) {
            if (model){
                footer.taskObject.recurrence = model;
                bulkDueDateUpdate();
            }
            else {
                $timeout(function(){
                    $scope.dueDateModal.show();
                });
            }
        };

        footer.start = function(){

            $ionicModal.fromTemplateUrl('html/views/modals/tasks/due_date.html', function ($ionicModal) {
                footer.dueDateModal = $ionicModal;
            }, {
                scope: footer,
                animation: 'scale-in'
            });
            createPopover();
            //footer.singleSelect = footer.multipleSelect = false;

        };

        footer.start();

        footer.$on('$stateChangeSuccess', function () {

            if( $scope.dueDateModal)   $scope.dueDateModal.remove();
            taskListView.clearAllSelected();

        });

        var taskFooterListener = $rootScope.$on('task-footer-toggle', function(){

            //footer.singleSelect = taskListView.singleSelect();
            //footer.multipleSelect = taskListView.multipleSelect();
            footer.isFavourite = taskListView.isAllFavourite();

            if($rootScope.singleSelect){
                $scope.selectedTask = taskListView.getSingleSelected();
            }
            else $scope.selectedTask = {};

            $scope.isForComplete=false;

            var allSelected=taskListView.getSelected();
            if(allSelected && allSelected.length>0 ){
                angular.forEach(allSelected,function(task,idx){
                   if(task.status=="complete"){
                       $scope.isForComplete=true;
                       return false;
                   }
                });

            }
            else{

            }

        });

        var taskFavouriteListener = $rootScope.$on('task:update-favourite', function(event, isFavourite){
            footer.isFavourite = isFavourite;
        });

        footer.$on('$destroy', function(){
            taskFooterListener();
            taskFavouriteListener();
        });

        //$scope.$on('$stateChangeStart', function (event, toState, toParams) {
        //    taskListView.clearAllSelected();
        //});

        $scope.bulkReopen=function(){

            var selected=taskListView.getSelected();
            var tasksToReopen=[];
            angular.forEach(selected,function(task){
               if(task.status==dbEnums.status.complete){
                   tasksToReopen.push(task);
               }
            });

            if(tasksToReopen.length>0){
                $ionicLoading.show();
                taskService.unCompleteTasks(selected)
                    .then(function(){
                        taskListView.clearAllSelected();
                        $rootScope.$emit('toast-message', message.successMessages.TASK_UNCOMPLETED);
                        $rootScope.$emit('pull-from-server');
                        //if(isDefaultView){
                            taskListView.setDefaultView();
                        //}
                        sharedData.taskHome(tasksToReopen[0],tasksToReopen[0].id);


                    },function(err){
                        $rootScope.$emit('toast-message', err.msg);
                    })
                    .finally(function(){
                        $ionicLoading.hide();
                    });

            }
        };

    }]);
}).call(this);
