(function() {
    app.service('socket',["$rootScope", "$state", "dbEnums", "toastService", "labelService", "CONSTANT", "taskService", "project", "userModel", "notificationModel", "filterService", "settingsService", "message", "$window", "taskModel", function( $rootScope, $state, dbEnums, toastService, labelService,
                                  CONSTANT,  taskService, project,  userModel, notificationModel,
                                  filterService, settingsService, message,$window,taskModel){
        var self = this;
        var ioSocket ;

        self.connect = function(){
            //Create socket and connect to Server
            ioSocket = io.connect(CONSTANT.api_link, { 'forceNew':true, query: "userId="+userModel.getLoggedInId() });

            self.enableAllListeners();
        };

        self.disconnect = function(){
            if(ioSocket) ioSocket.disconnect();
        };

        self.enableAllListeners = function(){
            ioSocket.on('connect',function(){
                //console.log(arguments);
                $window.localStorage.setItem('socketInfo', JSON.stringify({id:ioSocket.id}));

                console.log(ioSocket);
            });

            ioSocket.on('disconnect',function(){
                $window.localStorage.removeItem('socketInfo');

            });

            //user
            ioSocket.on( self.socketEventNames.user.userUpdated, function(user){
                    userModel.addOrUpdate(user, function(){});

            });
            ioSocket.on( self.socketEventNames.user.userSessionTimeOut, function(user){

                userModel.setRequestLoginEmail(user.email);
                $rootScope.$emit('logout', null, null);
                $rootScope.$emit('toast-message', message.successMessages.PASSWORD_UPDATED);

            });
            //project
            ioSocket.on( self.socketEventNames.project.projectUpdated, function(newProject){
                project.updateItem(newProject);
            });

            ioSocket.on( self.socketEventNames.project.projectDeleted, function(newProject){
                console.log(newProject.name);
                newProject.status = dbEnums.status.deleted;
                project.updateItem(newProject);
            });

            ioSocket.on( self.socketEventNames.project.projectLeft, function(newProject){
                newProject.status = dbEnums.status.deleted;
                project.updateItem(newProject);
            });

            //task
            ioSocket.on( self.socketEventNames.task.taskUpdated, function(newTask){
                taskService.updateItem(newTask);
            });

            //task completed
            ioSocket.on( self.socketEventNames.task.taskCompleted, function(newTask){
                console.log('Completed')
                taskService.updateItem(newTask);
                $rootScope.$emit('task-complete');
            });

            //label
            ioSocket.on( self.socketEventNames.label.labelUpdated, function(newLabel){
                labelService.updateItem(newLabel);
            });

            //filter
            ioSocket.on( self.socketEventNames.filter.filterUpdated, function(newFilter){
                filterService.updateItem(newFilter);
            });

            //settings
            ioSocket.on( self.socketEventNames.settings.settingsUpdated, function(newSettings){
                settingsService.updateItem(newSettings);
            });

            // foreground-push-notification
            ioSocket.on( self.socketEventNames.notification.foreground, function(title, message, data){

                toastService.openNotificationToast(title, message, data);
            });
            // new-notification
            ioSocket.on( self.socketEventNames.notification.notify, function(data){
                //$rootScope.newNotifications = ++$rootScope.newNotifications || 1;
                //notificationModel.setNoNN();
                notificationModel.addOrUpdate(data, function(){});
            });
            //notifications has been seen everywhere
            ioSocket.on( self.socketEventNames.notification.seen, function(){
                notificationModel.bulkSeen(function(){});
            });

            ioSocket.on(self.socketEventNames.user.taskOrderChanged,function(data){

                userModel.changeTaskSortOrder(data,function(){});

            });

            ioSocket.on( self.socketEventNames.task.taskDeleted, function(newTask){
                taskModel.delete(newTask.id);
                //taskService.updateItem(newTask);
            });

        };

        self.socketEventNames = {

            user:{
                userUpdated: 'user:updated',
                userSessionTimeOut: 'user:sessionTimeOut',
                taskOrderChanged:'user:taskOrderChanged'
            },
            project: {
                projectUpdated: 'project:updated',
                projectDeleted: 'project:deleted',
                projectLeft: 'project:left'
            },
            label: {
                labelUpdated: 'label:updated',
                labelDeleted: 'label:deleted'
            },
            filter:{
                filterUpdated: 'filter:updated',
                filterDeleted: 'filter:deleted'
            },
            task:{
                taskUpdated: 'task:updated',
                taskCompleted:'task:completed',
                taskDeleted:'task:deleted'
            },
            settings:{
                settingsUpdated: 'settings:updated'
            },
            notification : {
                foreground: "foreground-push-notification",
                notify: "notify",
                seen: "seen"
            }

        };

        self.getClientId=function(){
            return ioSocket.id;
        }

        $rootScope.$on('connect-socket', function(){
            if(userModel.isAuthenticated()){
                self.connect();
            }

        });

        $rootScope.$on('disconnect-socket', function(){
            self.disconnect();
        });

    }])

}).call(this);