(function(){
    app.service('rightMenuService', function($rootScope, $state, project, user, dbEnums, message, sharedData,
                                             date, notificationService, userModel, $ionicPopup, stringService, CONSTANT, $ionicModal,$ionicLoading,roleValidators,sync,RESPONSE_CODE,connectivity,$http,API){
        var self  = this;

        var BOTTOM_MENU_ITEMS_VALUE = {
            DELETE: 'DELETE',
            REMINDER: 'REMINDER'
        };
        var MENU_ITEMS_VALUE = {
            ARCHIVE : 'ARCHIVE',
            DELETE : 'DELETE',
            EDIT: 'EDIT',
            HELP: 'HELP',
            INVITE_USERS: 'INVITE_USERS',
            LEAVE: 'LEAVE',
            LINK: 'LINK',
            LOGOUT : 'LOGOUT',
            NOTIFICATION: 'NOTIFICATION',
            REFRESH : 'REFRESH',
            SEARCH : 'SEARCH',
            SETTINGS : 'SETTINGS',
            VIEW_USERS: 'VIEW_USERS',
            PROJECT_ADMIN_REQUEST:'PROJECT_ADMIN_REQUEST'
        };

        var MENU_ITEMS = [];

        var MENU_TYPES = {
            FILTER: 'filter',
            LABEL: 'label',
            PROJECT: 'project',
            TASK: 'task'
        };


        function openArchiveProjectPopup(object, scope) {
            $ionicPopup.show({
                title: message.infoMessages.PROJECT_ARCHIVED_CONFIRMATION.title,
                template:  message.infoMessages.PROJECT_ARCHIVED_CONFIRMATION.message,
                scope: scope,
                buttons: [{
                    text: stringService.NO,
                    type: 'btn-no',
                    onTap: function () {
                        return true;
                    }
                },
                    {
                        text: stringService.YES,
                        type: 'btn-yes',
                        onTap: function () {
                            project.archive(object).then(function(){
                                $rootScope.$emit('toast-message', message.successMessages.PROJECT_ARCHIVED);
                                sharedData.home();
                            });
                        }
                    }]
            });
        }

        function openCopyTaskLinkModal(object, scope) {
            scope.copy = function(){
               scope.copyTaskLinkModal.remove();

            };

            $ionicModal.fromTemplateUrl('html/views/modals/copy-task-link.html', function ($ionicModal) {

                scope.copyTaskLinkModal = $ionicModal;
                scope.link = CONSTANT.app_link+ "/#/task/edit/"+object.id;
                scope.modalTitle = message.infoMessages.LINK_TO_TASK_CONFIRMATION.title;
                scope.modalDescription = message.infoMessages.LINK_TO_TASK_CONFIRMATION.message;
                scope.copyTaskLinkModal.show();
            }, {
                scope: scope,
                animation: 'scale-in'
            });


        }

        function openDeleteProjectPopup(object, scope) {
            var usr=userModel.getLoggedInUser();
            var canDelete=project.canDeleteProject(object,usr);
            if(canDelete){
                openDeleteProjectConfirmationPopups(object,scope);
            }
            else{
                $ionicPopup.show({
                    title: message.infoMessages.PROJECT_DELETED_DISALLOWED.title,
                    template:  message.infoMessages.PROJECT_DELETED_DISALLOWED.message,
                    scope: scope,
                    buttons: [{
                        text: stringService.OK,
                        type: 'btn-ok',
                        onTap: function () {
                            return true;
                        }
                    }]
                });
            }

        }

        function openDeleteProjectConfirmationPopups(object,scope){
            $ionicPopup.show({
                title: message.infoMessages.PROJECT_DELETED_CONFIRMATION.title,
                template:  message.infoMessages.PROJECT_DELETED_CONFIRMATION.message,
                scope: scope,
                buttons: [{
                    text: stringService.NO,
                    type: 'btn-no',
                    onTap: function () {
                        return true;
                    }
                },
                    {
                        text: stringService.YES,
                        type: 'btn-yes',
                        onTap: function () {
                            project.delete(object).then(function(){
                                $rootScope.$emit('toast-message', message.successMessages.PROJECT_DELETED);
                                sharedData.home();
                            });
                        }
                    }]
            });
        }

        function openLeftProjectPopup(object, scope) {
            $ionicPopup.show({
                title: message.infoMessages.PROJECT_LEFT_CONFIRMATION.title,
                template:  message.infoMessages.PROJECT_LEFT_CONFIRMATION.message,
                scope: scope,
                buttons: [{
                    text: stringService.NO,
                    type: 'btn-no',
                    onTap: function () {
                        return true;
                    }
                },
                {
                    text: stringService.YES,
                    type: 'btn-yes',
                    onTap: function () {
                        project.left(object).then(function(){
                            $rootScope.$emit('toast-message', message.successMessages.PROJECT_LEFT);
                            sharedData.home();
                        });
                    }
                }]
            });
        }

        self.getMenu = function(){
            return MENU_ITEMS;
        };

        self.getBottomMenu = function(){
            return [
                {
                    title: 'Reminder',
                    value: BOTTOM_MENU_ITEMS_VALUE.REMINDER
                },
                {
                    title: 'Delete',
                    value: BOTTOM_MENU_ITEMS_VALUE.DELETE
                }];
        };
        
        self.itemClicked  = function(item, object, scope, event){
            switch (item.value) {

                case MENU_ITEMS_VALUE.ARCHIVE:
                    openArchiveProjectPopup(object, scope);
                    break;

                case MENU_ITEMS_VALUE.DELETE:
                    if(item.type == MENU_TYPES.FILTER){

                    }
                    else if(item.type == MENU_TYPES.LABEL) {

                    }
                    else if(item.type == MENU_TYPES.PROJECT) {
                        openDeleteProjectPopup(object, scope);
                    }
                    break;

                case MENU_ITEMS_VALUE.EDIT:
                    var stateName;
                    if(item.type == MENU_TYPES.FILTER) stateName = '/filter/edit';
                    else if(item.type == MENU_TYPES.LABEL) stateName = '/label/edit';
                    else if(item.type == MENU_TYPES.PROJECT) stateName = '/project/edit';
                    $state.go(stateName,{id: object.id});
                    break;

                case MENU_ITEMS_VALUE.HELP:
                    break;

                case MENU_ITEMS_VALUE.INVITE_USERS:
                    var loggedInUser=userModel.getLoggedInUser();

                    roleValidators.checkUserRole(loggedInUser,dbEnums.USER_ROLES.MAX_USERS_PROJECT,{project:object.id},true);

                    $state.go('/project/invite',{id: object.id});
                    break;

                case MENU_ITEMS_VALUE.LEAVE:
                    openLeftProjectPopup(object, scope);
                    break;

                case MENU_ITEMS_VALUE.LINK:
                    openCopyTaskLinkModal(object, scope);
                    break;

                case MENU_ITEMS_VALUE.LOGOUT:
                    user.logout();
                    break;
                case MENU_ITEMS_VALUE.NOTIFICATION:
                    self.openNotificationBar(event, scope);
                    break;

                case MENU_ITEMS_VALUE.REFRESH:
                    $ionicLoading.show();
                    var pullEventListener=$rootScope.$on('pull-from-server-complete',function(){
                        pullEventListener();
                        $ionicLoading.hide();
                    });

                    $rootScope.$emit('push-to-server', true);

                    break;

                case MENU_ITEMS_VALUE.SEARCH:
                    $rootScope.$emit('attach-focus','search-box');
                    break;


                case MENU_ITEMS_VALUE.SETTINGS:
                    $state.go('/settings');
                    break;

                case MENU_ITEMS_VALUE.VIEW_USERS:
                    $state.go('/project/users', {id: object.id});
                    break;
                case MENU_ITEMS_VALUE.PROJECT_ADMIN_REQUEST:
                    confirmProjectAdminRequest(object);
                    break;

            }
        };

        self.openNotificationBar = function(event, scope){
            var startTime=moment();
            //console.log(startTime.format("hh:mm:ss:sss"));
            notificationService.getNotifications().then(function(results){
                //console.log("after data from db  : "+moment().format("hh:mm:ss:sss"));
                scope.items = [];
                if(results.length){
                    var notBar=new NotificationBar(scope.notificationBar,notificationService,event,scope,results);
                    //console.log("after notificationbar class init : "+moment().format("hh:mm:ss:sss"));
                    scope.notification=notBar;
                    scope.notificationBar.show(event).then(function(){
                        //console.log("scope.notificationBar.show complete : "+moment().format("hh:mm:ss:sss"));
                    });
                    //console.log("scope.notificationBar.show : "+moment().format("hh:mm:ss:sss"));
                    notificationService.seenNotifications();
                    //console.log("notificationService.seenNotifications : "+moment().format("hh:mm:ss:sss"));

                }
            });
        };


        self.setMenu = function(type, object){

            MENU_ITEMS = [
                {
                    title: 'Refresh',
                    value: MENU_ITEMS_VALUE.REFRESH
                },

                {
                    title: 'Notifications',
                    value: MENU_ITEMS_VALUE.NOTIFICATION,
                    isNotification: true
                },
                {
                    title: 'Settings',
                    value: MENU_ITEMS_VALUE.SETTINGS
                }];

            if(type){
               switch(type){
                   case MENU_TYPES.FILTER:
                       break;
                   case MENU_TYPES.LABEL:

                       break;
                   case MENU_TYPES.PROJECT:
                       MENU_ITEMS.push({
                           title: 'Edit project',
                           value: MENU_ITEMS_VALUE.EDIT,
                           type: MENU_TYPES.PROJECT
                       });
                       MENU_ITEMS.push({
                           title: 'View users',
                           value: MENU_ITEMS_VALUE.VIEW_USERS
                       });
                       MENU_ITEMS.push({
                           title: 'Invite user to project',
                           value: MENU_ITEMS_VALUE.INVITE_USERS
                       });
                       MENU_ITEMS.push({
                           title: 'Archive project',
                           value: MENU_ITEMS_VALUE.ARCHIVE
                       });

                       var role = object ? project.getUserRole(object, userModel.getLoggedInId()): stringService.EMPTY;
                       var users = object ? object.users : [];
                       if(role == dbEnums.projectUserRole.admin){
                           var sendAdminLink={
                               title:'Make another user Project Admin',
                               value:MENU_ITEMS_VALUE.PROJECT_ADMIN_REQUEST,
                               type:MENU_TYPES.PROJECT
                           };

                           MENU_ITEMS.push(sendAdminLink);

                           var opt={
                               title: 'Delete project',
                               value: MENU_ITEMS_VALUE.DELETE,
                               type: MENU_TYPES.PROJECT,
                               disabled:!project.canDeleteProject(object)
                           };

                           MENU_ITEMS.push(opt);


                       }
                       else{
                           MENU_ITEMS.push({
                               title: 'Leave project',
                               value: MENU_ITEMS_VALUE.LEAVE,
                               type: MENU_TYPES.PROJECT
                           });
                       }
                       break;
                   case MENU_TYPES.TASK:
                       MENU_ITEMS.push({
                           title: 'Link to task',
                           value: MENU_ITEMS_VALUE.LINK,
                           type: MENU_TYPES.TASK
                       });
               }
            }

            MENU_ITEMS.push({
                title: 'Help',
                value: MENU_ITEMS_VALUE.HELP
            });

            MENU_ITEMS.push({
                title: 'Logout',
                value: MENU_ITEMS_VALUE.LOGOUT
            });
        };

        function NotificationBar(notificationBar,notificationService,event,$scope,initialData){
            var self=this;
            self.skip=0;this.limit=25;
            self.initialData=initialData||[];
            self.items=[];
            function setItems(items) {
                var itemsColl=[];
                if(items.length>0) {

                    items.forEach(function (item) {
                        item.date = date.getDateTimeFromNow(item.date_created);

                        if (item.isProject) {
                            item.redirectTo = item.isProjectDeleted ? '#/' : '#/project/details/' + item.project.id;

                        }
                        else if (item.isNote) {
                            item.redirectTo = '#/task/note/' + item.task.id+'?focusMe='+(item.note?item.note.id:'');
                        }
                        else if(item.isCompleted) {
                            item.redirectTo = '#/task/closed?tasks=' + item.task.id;
                        }
                        else {
                            item.redirectTo = '#/task/edit/' + item.task.id;
                        }
                        if(item.task && item.task.status && item.task.status==dbEnums.status.deleted){
                            item.redirectTo='javascript:void(0)';
                        }
                        if (item.isNote && item.isCompleted) {

                        }
                        //itemColls.push(item);
                        item.markAsUnread = !item.seen;
                        itemsColl.push(item);

                    });

                    itemsColl = _.orderBy(itemsColl, 'date_created', 'desc');
                    self.items.concat(itemsColl);
                    itemsColl.forEach(function(item){
                        self.items.push(item);
                    });
                }
                return itemsColl;
            }

            this.loadMore = function() {
                console.log("loadMore : "+moment().format("hh:mm:ss:sss"));
                if(self.skip===0) {

                        if (self.initialData.length>0) {
                            setItems(self.initialData);
                            self.skip+=self.initialData.length;
                        }
                        else  self.noMoreItemsAvailable = true;

                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    console.log("loadMore ends : "+moment().format("hh:mm:ss:sss"));

                }
                else {

                    notificationService.getAllNotificationsByUserId(self.skip,self.limit)
                        .then(function(results){

                            if(results.length){
                                setItems(results);

                                self.skip +=results.length;
                            }
                            else  self.noMoreItemsAvailable = true;
                            console.log("loadMore ends : "+moment().format("hh:mm:ss:sss"));
                            $scope.$broadcast('scroll.infiniteScrollComplete');
                        });

                }

                //$scope.$broadcast('scroll.infiniteScrollComplete');

            };
            this.loadMore();
        }

        function confirmProjectAdminRequest(project){
            //alert('menu clicked '+project.id);
            var childScope=$rootScope.$new();

            $ionicPopup.show({
                title: message.infoMessages.PROJECT_ADMIN_REQUEST_CONFIRMATION.title,
                template:  message.infoMessages.PROJECT_ADMIN_REQUEST_CONFIRMATION.message,
                scope: childScope,
                buttons: [{
                    text: stringService.NO,
                    type: 'btn-no',
                    onTap: function () {
                        return true;
                    }
                },
                    {
                        text: stringService.YES,
                        type: 'btn-yes',
                        onTap: function () {
                            //alert('pressed yes');
                            //console.log(project);
                            getNewAdminDetails(project);
                        }
                    }]
            });

            //console.log(project);
        };


        var projectAdminRequestDetailModal;
        //var newAdminDetailsModalScope;
        function getNewAdminDetails(project){

            var newAdminDetailsModalScope=$rootScope.$new();
            newAdminDetailsModalScope.project=project;
            newAdminDetailsModalScope.sendProjectAdminRequest=self.sendProjectAdminRequest;
            newAdminDetailsModalScope.removeProjectAdminRequestDetailModal=removeProjectAdminRequestDetailModal;
            newAdminDetailsModalScope.model={};
            $ionicModal.fromTemplateUrl('html/views/modals/project/project_admin_request_details.html', function ($ionicModal) {

                projectAdminRequestDetailModal = $ionicModal;
                newAdminDetailsModalScope.project = project

                projectAdminRequestDetailModal.show();
            }, {
                scope: newAdminDetailsModalScope,
                animation: 'scale-in'
            });
        }


        function removeProjectAdminRequestDetailModal(evt){
            projectAdminRequestDetailModal.remove();
            evt.preventDefault();
        }

        self.sendProjectAdminRequest=function(evt,project,model){

            //alert('sendProjectAdminRequest');

            var existingProjectUser= _.find(project.users,function(usr){
               return usr.email==model.email;
            });
            if(!existingProjectUser){
                $ionicPopup.alert({
                    title: message.errorMessages.PROJECT_ADMIN_INVITATION_INVALID_PROJECT_USER.title,
                    content: message.errorMessages.PROJECT_ADMIN_INVITATION_INVALID_PROJECT_USER.message,
                    buttons: [{
                        text: stringService.OK,
                        onTap: function () {
                            return false;
                        }
                    }]
                });
                return false;
            }

            projectAdminRequestDetailModal.remove();
            var loggedInUser=userModel.getLoggedInUser();
            loggedInUser.password=model.password;
            var data={
                project:project,
                user:loggedInUser,
                newAdmin:model.email
            };
            if(connectivity.isConnected()){

                $http.post(API.project.adminInvitation, data)
                    .success(function (results) {

                        if (results.response_code === RESPONSE_CODE.SUCCESS) {
                            $rootScope.$emit('toast-message',message.successMessages.PROJECT_ADMIN_INVITATION_SENT);

                        } else if (results.response_code === RESPONSE_CODE.ERROR) {
                            if(results.errors.message){
                                $rootScope.$emit('toast-message',{title:results.errors.message});
                            }

                        }

                    })
                    .error(function (err) {
                        $rootScope.$emit('toast-message',{title:err.message});

                    });
            }
            else {
                $rootScope.$emit('toast-message',message.errorMessages.CONNECTION_ERROR);

            }

            //sync.add(dbEnums.collections.Project,{
            //    project: project,
            //    user:loggedInUser,
            //    newAdmin:model.email,
            //
            //} , dbEnums.events.Project.adminInvitation);
            //

            console.log(project);
        };
    });
}).call(this);
