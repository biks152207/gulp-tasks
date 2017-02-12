(function () {
    app.controller('noteTaskController', function ($rootScope, $scope, $stateParams, $ionicScrollDelegate, $state, $ionicModal,
                                                   userModel, $ionicPopup, $timeout, stringService, taskService, dbEnums, headerService,
                                                   guidGenerator,  noteService, date, sharedData, message, connectivity,$location,uiHelperService,popupService,roleValidators,CONSTANT,$q) {
        $scope.selected = [];

        $scope.noteIds = [];
        console.log('note task controller');
        $scope.canUploadFile=false;
        $scope.loadingText="Uploading...";

        function createModals() {
            $ionicModal.fromTemplateUrl('html/views/modals/file_upload.html', function ($ionicModal) {
                $scope.fileUploadModal = $ionicModal;
            }, {
                scope: $scope,
                animation: 'scale-in'
            });

            $ionicModal.fromTemplateUrl('html/views/modals/progress_bar.html', function ($ionicModal) {
                $scope.progressBarModal = $ionicModal;
            }, {
                scope: $scope,
                animation: 'scale-in'
            });

        }

        $scope.openFileUpload = function(){
            var user=userModel.getLoggedInUser();
            console.log('file uploading....')
            console.log(user);
            roleValidators.checkUserRole(user,dbEnums.USER_ROLES.FILE_UPLOAD,{},true)
                .then(function(){
                    if(connectivity.isConnected()){
                        $scope.fileUploadModal.show()
                    }
                    else $rootScope.$emit('toast-message', message.errorMessages.CONNECTION_REQUIRED);
                });

        };

        $scope.resetTaskObject = function(){
            $scope.note = {};
            taskService.clearTaskObject();
        };

        $scope.noteListFormat = function () {

            $scope.taskObject.notes.forEach(function (note) {

                note.dateModified = date.getDateTime(note.date_modified);
                note.selected = false;
            });

            //$ionicScrollDelegate.$getByHandle('x').scrollBottom();
        };

        $scope.setNoteForm = function () {

            $scope.note = {
                id: guidGenerator.getId(),
                updatedBy: userModel.getLoggedInUser(),
                description: stringService.EMPTY,
                status: dbEnums.status.active,
                editable: false,
                position: -1
            };
            $scope.selected = [];
            $scope.noteIds = [];
            $scope.isSelect = false;
        };

        $scope.editForm = function () {

            $scope.note = angular.copy($scope.selected[0]);
            $scope.note.editable = true;
            $scope.isSelect = false;

        };

        $scope.editNote = function () {

            var data = {
                taskId: $scope.taskId,
                note: $scope.note
            };
            noteService.edit(data).then(function(results){
                //$timeout(function(){
                //
                //});
                $rootScope.$emit('toast-message', message.successMessages.NOTE_EDITED);
            });
        };

        $scope.addNote = function () {

            var data = {
                taskId: $scope.taskId,
                note: $scope.note
            };

            noteService.add(data).then(function(results){
                $timeout(function(){
                    $scope.$broadcast('scroll.refreshComplete');
                    $timeout(function(){
                        $ionicScrollDelegate.$getByHandle('noteScroll') .scrollBottom(true);
                    });

                },200);

                $rootScope.$emit('toast-message', message.successMessages.NOTE_SAVED);
            });
        };

        $scope.save = function(){
            taskService.setTaskObject($scope.taskObject);
            if($scope.taskObject.name){
             taskService.add($scope.taskObject).then(function(results){

                 if(results){
                     $scope.resetTaskObject();
                     $rootScope.$emit('toast-message', message.successMessages.TASK_SAVED);
                     sharedData.home();
                 }
             });
            }
            else{
             $rootScope.taskSaved = true;
             $state.go('/task/add');
            }
       };

        $scope.saveNote = function () {

            if(!$scope.note.description) return;
            $scope.note.date_modified = Date.now();

            if ($scope.taskId) {

                if ($scope.note.editable) $scope.editNote();
                else $scope.addNote();
            }

            if (!$scope.taskId){
                $scope.note.dateModified = date.getDateTime($scope.note.date_modified);
                $scope.taskObject.notes.push($scope.note);
            }

        };

        //For elastic text area resize footer
        $scope.$on('taResize', function (e, ta) {
            $timeout(function(){
                var footerBar = document.body.querySelector('.bar-stable');
                if (!ta) return;

                var taHeight = ta[0].offsetHeight;
                if (!footerBar) return;

                var newFooterHeight = taHeight + 10;
                newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;
                footerBar.style.height = newFooterHeight + 'px';
            });
        });

        $scope.setFooterPermission = function () {

            var multiSelect = $scope.selected.length > 1;
            var isFile = $scope.selected[0].isFile;

            for (var i = 0; i < $scope.selected.length; i++) {
                var isCreator = $scope.selected[i].updatedBy._id === userModel.getLoggedInId();
                if (!isCreator) break;
            }

            $scope.copyPermission = !isFile && !multiSelect;
            $scope.editPermission = !isFile && !multiSelect && isCreator;
            $scope.deletePermission = isCreator;
        };

        $scope.clicked = function (member, position) {

            var index = $scope.selected.indexOf(member);
            if (index > -1) {
                $scope.selected.splice(index, 1);
                $scope.noteIds.splice(index, 1);
                member.selected = false;
                member.position = -1;
            } else {

                $scope.selected.push(member);
                $scope.noteIds.push(member.id);
                member.position = position;
                member.selected = true;
            }
            if ($scope.selected.length <= 0) {
                $scope.setNoteForm();
            }
            else {
                $scope.isSelect = true;
                $scope.setFooterPermission();
            }

        };

        $scope.start = function () {
            //$scope.mode=$state.current.mode||'edit';
            if($rootScope.rightDefaultViewVisible){
                $rootScope.$emit('set-page','Task_Notes');
            }
            var user=userModel.getLoggedInUser();
            roleValidators.checkUserRole(user,dbEnums.USER_ROLES.FILE_UPLOAD,{},false)
                .then(function(){
                   $scope.canUploadFile=true;
                });

            function initTask(task){
                if(task){
                    $scope.taskObject = task;
                    $scope.title = task.name;
                    $scope.disableModification=task.status==dbEnums.status.complete;
                    $scope.setNoteForm();
                    $scope.noteListFormat();
                    $rootScope.$emit('task:header',$state.current.state, task);
                    $timeout(function(){
                        //$ionicScrollDelegate.$getByHandle('noteScroll').resize();
                        //$timeout(function(){
                        if(task.notes.length>0)
                        {
                            var focusTo=task.notes[task.notes.length-1].id;
                            if($stateParams.focusMe){
                                focusTo=$stateParams.focusMe;
                                uiHelperService.focusTo(focusTo,$ionicScrollDelegate.$getByHandle('noteScroll'));

                            }
                            else{
                                uiHelperService.scrollTo(focusTo,$ionicScrollDelegate.$getByHandle('noteScroll'));
                            }

                        }

                            //$ionicScrollDelegate.$getByHandle('noteScroll').scrollBottom(false);
                        //},1000);
                    },200);

                }
                else sharedData.home();

            }

            if($stateParams.id){
                $scope.taskId = $stateParams.id;
                $scope.addUrl =  '#/task/edit/' + $stateParams.id ;
                $scope.noteUrl = '#/task/note/' + $stateParams.id;
                taskService.findActiveTaskById($scope.taskId).then(function(task){
                    if(!task){
                        if(!$rootScope.closedTask){

                            taskService.getTaskFromServer($scope.taskId)
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
                })
            }
            else{
                $scope.title = 'Add Note';
                $scope.taskObject = taskService.getTaskObject();
                $scope.addUrl = '#/task/add';
                $scope.noteUrl = '#/task/note/';
                $scope.setNoteForm();
                $scope.noteListFormat();
                $rootScope.$emit('task:header');
            }

            createModals();
            headerService.setTaskNoteHeader($scope, $stateParams.id);

        };

        $scope.start();

        $scope.uploadNoteFile = function (file) {
            var data = {
                file: file,
                id: guidGenerator.getId(),
                updatedBy: userModel.getLoggedInUser(),
                parent: $scope.taskId
            };

            var asyncTasks=$q(function(resolve,reject){
                var user=userModel.getLoggedInUser();
               roleValidators.checkUserRole(user,dbEnums.USER_ROLES.FILE_STORAGE_MAX,{file:file},true)
                   .then(resolve,reject);
            });
            asyncTasks.then(function(){
                $scope.progressBarModal.show();
                noteService.uploadNote(data).then(function (results) {
                    if(!results.error){
                        $scope.setNoteForm();
                        $scope.noteListFormat();
                        $ionicScrollDelegate.$getByHandle('noteScroll') .scrollBottom(true);
                    }
                    if(results && results.results && results.results.errors && results.results.errors.key=='LICENSE'){
                        popupService.roleWarning(null,results.results.errors)
                            .then(function(){
                                if(window.cordova){
                                    $window
                                        .open(
                                        encodeURI(CONSTANT.upgradeUrl), '_system', 'location=no');
                                }
                                else{
                                    $window.open(
                                        CONSTANT.upgradeUrl,
                                        '_blank'
                                    );
                                }

                                console.log('UPGRADE code goes here');

                            },function(){
                                console.log('UPGRADE CANCEL code goes here')
                            });
                    }
                    else{
                        $rootScope.$emit('toast-message', results.msg);
                    }

                    $scope.progressBarModal.hide();
                });
            },function(err){
                if(err && (!err.key || err.key!='LICENSE')){
                    $rootScope.$emit('toast-message', results.msg);
                }
            });


        };

        $scope.onFileSelected = function (files) {
            $scope.fileUploadModal.hide();
            console.log(files);
            console.log('getting files...')
            if (files && files.length) {
                var firstFile=files[0];
                var user=userModel.getLoggedInUser();

                roleValidators.checkUserRole(user,dbEnums.USER_ROLES.FILE_UPLOAD_SIZE,{file:firstFile},true)
                    .then(function(){
                        for (var i = 0; i < files.length; i++) {
                            var file = files[i];


                            $scope.uploadNoteFile(file);

                        }
                    });


            }
        };

        $scope.deleteNote = function () {

            var infoMsg ;
            if ($scope.selected[1]) infoMsg = message.infoMessages.MULTIPLE_NOTES_DELETE_CONFIRMATION;
            else if( $scope.selected[0].isFile) infoMsg = message.infoMessages.SINGLE_FILE_DELETE_CONFIRMATION;
            else infoMsg = message.infoMessages.SINGLE_NOTE_DELETE_CONFIRMATION;
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
                            if ($scope.taskId) {
                                $scope.note = angular.copy($scope.selected[0]);
                                var data = {
                                    taskId: $scope.taskId,
                                    noteIds: $scope.noteIds
                                };
                                console.log($scope.noteIds);
                                noteService.delete(data).then(function(results){
                                    $rootScope.$emit('toast-message', message.successMessages.NOTE_DELETED);
                                });
                            }
                            else {
                                var index = $scope.taskObject.notes.indexOf($scope.selected[0]);
                                if (index > -1) $scope.taskObject.notes.splice(index, 1);

                                $scope.setNoteForm();
                                $scope.noteListFormat();
                                $scope.selected = [];
                                $scope.noteIds = [];
                                $scope.isSelect = false;
                            }

                        }
                    }]
            });
        };

        $scope.discardPopup = function (toState, toParams) {
            $ionicPopup.show({
                template: message.infoMessages.DISCARD_CHANGE.message,
                title: message.infoMessages.DISCARD_CHANGE.title,
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
                            $scope.resetTaskObject();
                            $state.go(toState.name, toParams);
                        }
                    }]
            });
        };

        $scope.copyNote = function () {
            $rootScope.$emit('toast-message', message.successMessages.NOTE_COPIED);
            $scope.copiedNote = angular.copy($scope.selected[0].description);
            $scope.selected = [];
            $scope.noteIds = [];
            $scope.isSelect = false;
            $scope.noteListFormat();
        };

        var taskListListener = $rootScope.$on('taskList-update', function () {
            taskService.findById($scope.taskId).then(function(task){
                if(task){
                    $scope.taskObject = task;
                    $scope.setNoteForm();
                    $scope.noteListFormat();

                }
            })
        });

        $scope.$on('$stateChangeStart', function (event, toState, toParams) {

            if (toState.name === '/task/add' ||  toState.name === '/task/edit'){
                taskService.setTaskObject($scope.taskObject);
            }
            else if ((!$scope.taskId && taskService.taskObjectHasValue()) || $scope.note.description) {
                event.preventDefault();
                $scope.discardPopup(toState, toParams);
            }

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

        function switchTabUrl(url){
            $state.go()
        }

        $scope.$on('$destroy', taskListListener);
        //var pos=$('#'+$location.search().noteId).position();
        //
        //$ionicScrollDelegate.scrollTo(pos.left,pos.top);
    });

}).call(this);
