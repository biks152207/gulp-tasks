(function(){
    app.service('reminderService', function ($cordovaLocalNotification, $rootScope, $state, taskService,
                                             date,  reminderModel, $interval,  message, userModel, dbEnums, $q,CONSTANT) {

        var platform = ionic.Platform.platform();
        var reminderBucket = [];
        var self  = this;
        var isExist=[];
        var audio=new Audio('media/sound/notification.mp3');


        self.notificationChannels = {
            email:{
                title: 'Email',
                value: true,
                notified: false
            },
            push:{
                title: 'Push',
                value: false,
                notified: true
            }
        };

        self.timeDuration= [
            {title: '0 minutes before',
                value: 9,
                minutes:0
            },
            {title: '5 minutes before',
                value: 0,
                minutes:5
            },
            {title: '15 minutes before',
                value: 1,
                minutes: 15
            },
            {title: '30 minutes before',
                value: 2,
                minutes: 30
            },
            {title: '1 hour before',
                value: 3,
                minutes: 60
            },
            {title: '2 hours before',
                value: 4,
                minutes: 120
            },
            {title: '3 hours before',
                value: 5,
                minutes: 180
            },
            {title: '6 hours before',
                value: 6,
                minutes: 360
            },
            {title: '12 hours before',
                value: 7,
                minutes: 720
            },
            {title: '1 day before',
                value: 8,
                minutes: 1440
            }
        ];

        self.init = function () {

            if (isMobileDevice()){
                $cordovaLocalNotification.registerPermission();
            }

        };


        self.getScheduledTime = function(reminder, dueDate){
            var scheduleTime;
            if(reminder.time.id){
                scheduleTime = new Date(reminder.time.value);
            }
            else{
                scheduleTime = new Date(dueDate);
                scheduleTime.setMinutes(scheduleTime.getMinutes() - self.timeDuration[reminder.time.value].minutes);
            }
            return scheduleTime;
        };

        function addMobileReminder(task, reminder, scheduleTime){

            if(reminderBucket[reminder.id]){

                $cordovaLocalNotification.update({
                    id: reminderBucket[reminder.id].UID,
                    at:   scheduleTime,
                    text: task.recurrence.due_date ? "Due: "+ date.getDateTime(task.recurrence.due_date): message.infoMessages.NO_DUE_DATE_SET.message,
                    title: "Reminder: "+ task.name
                }).then(function(){
                    console.log("The notification has updated");
                });

            }
            else {
                reminder.UID = getReminderUID();
                isExist[reminder.UID] = true;
                reminderBucket[reminder.id] = reminder;

                $cordovaLocalNotification.schedule({
                    id: reminder.UID,
                    icon: "res://ic_stat_onesignal_default",
                    at: scheduleTime,
                    text: task.recurrence.due_date ? "Due: "+ date.getDateTime(task.recurrence.due_date): message.infoMessages.NO_DUE_DATE_SET.message,
                    title: "Reminder: "+ task.name,
                    data: JSON.stringify({
                        taskId: task.id,
                        reminderId:reminder.id
                    })
                    //, sound:'file://media/sound/notification.mp3'
                }).then(function () {
                    console.log("The notification has been set");

                });
            }
        }


        function addWebReminder(task, reminder, scheduleTime){
                reminder.taskId = task.id;
                reminder.scheduleTime = scheduleTime;
                reminderModel.addOrUpdate(reminder, function(){});
        }

        function getReminderUID(){
            var UID ;
            do{
                UID = parseInt(Math.random()*10000000);
            }while(isExist[UID]);
            return UID;
        }

        function isMobileDevice(){
            return (platform === 'android' || platform === 'ios')
                && (window.cordova)
                ;
        }

        function pullActiveReminder(){

            if(userModel.isAuthenticated()){

                reminderModel.getAll(function(err, list){
                    var now = new Date();
                    var next = new Date();
                    next.setMinutes(now.getMinutes()+1);
                    list.forEach(function(reminder){
                        if(date.isInRange(now, next, reminder.scheduleTime)){

                                taskService.findById(reminder.taskId).then(function(task){

                                    var title = 'Reminder: '+task.name;
                                    var msg ;
                                    if(task.recurrence.due_date){
                                        msg = 'Due:  '+ date.getDateTime(task.recurrence.due_date);
                                    }
                                    else msg = message.infoMessages.NO_DUE_DATE_SET.message;
                                    console.log('Reminder: Task - '+task.name+' :::: Reminder id - '+reminder.id);
                                    triggerWebReminder(reminder, title, msg);
                                    taskService.reminderDeleted(task.id, reminder.id);
                                    reminderModel.delete(reminder.id, function(){
                                    });
                                });

                        }
                    });
                });
            }

        }


        function triggerWebReminder(reminder, title, msg){
            console.log(title+' :::: Reminder id - '+reminder.id);
            var data = {
                state: '/task/edit',
                params: reminder.taskId
            };
            notify.createNotification(title, {
                body: msg,
                icon: CONSTANT.iconUrl
            });
            audio.play();
        }
        self.addReminder = function(task, reminder){
            var scheduleTime = self.getScheduledTime(reminder, task.recurrence.due_date);

            if(!date.isPast(scheduleTime) && reminder.notificationChannels.push.value){
                if(isMobileDevice()){
                    addMobileReminder(task, reminder, scheduleTime)
                }
                else{
                    addWebReminder(task, reminder, scheduleTime);
                }
            }
        };

        self.deleteReminder = function(task, reminder){
            if(isMobileDevice()){
                if(!reminderBucket[reminder.id]) return;
                $cordovaLocalNotification.clear(reminderBucket[reminder.id].UID).then(function(){});
            }
            else{
                reminderModel.delete(reminder.id, function(){});
            }
        };

        self.deleteRemindersByTaskId = function(taskId){
            var defer = $q.defer();
            if(isMobileDevice()){
                    for(var id in reminderBucket){
                        if(reminderBucket.hasOwnProperty(id) && reminderBucket[id].taskId == taskId){
                            if(!reminderBucket[reminder.id]) return;
                            $cordovaLocalNotification.clear(reminderBucket[id].UID).then(function(){});
                        }
                    }
                defer.resolve();
            }else{

                reminderModel.deleteRemindersByTaskId(taskId, function(){
                        defer.resolve();
                });

            }

            return defer.promise;
        };



        $rootScope.$on('reminder:setReminders', function(event, task){
            var loginId = userModel.getLoggedInId();

            if(task.status == dbEnums.status.active){
                self.deleteRemindersByTaskId(task.id).then(function(){
                    task.reminders.forEach(function(reminder){
                        if(loginId == reminder.assignee._id){
                            self.addReminder(task, reminder);
                        }
                    });
                });

            }
            else{
                task.reminders.forEach(function(reminder){
                    if(loginId == reminder.assignee._id){
                        self.deleteReminder( task, reminder);
                    }
                });
            }
        });

        if(isMobileDevice()){

            window.cordova.plugins.notification.local.on("trigger", function(notification) {
                console.log('reminder triggered.');
                var data = JSON.parse(notification.data);
                taskService.reminderDeleted(data.taskId, data.reminderId);

                reminderModel.delete(data.reminderId, function(){
                });

                $cordovaLocalNotification.clear(notification.id).then(function(){

                });
            });
            $rootScope.$on('$cordovaLocalNotification:click', function(event, notification, state) {
                 var data = JSON.parse(notification.data);
                taskService.reminderDeleted(data.taskId, data.reminderId)
                    .then(function(){
                        $state.go('/task/edit', {id: data.taskId});
                    });

                reminderModel.delete(data.reminderId, function(){
                });

                 $cordovaLocalNotification.clear(notification.id).then(function(){

                 });

             });
        }else{
            $interval(pullActiveReminder, 60000);
        }


        function cleanUpReminderOfTask(task){
            var loginId = userModel.getLoggedInId();
            task.reminders.forEach(function(reminder){
                if(loginId == reminder.assignee._id){
                    var scheduleTime = self.getScheduledTime(reminder, task.recurrence.due_date);
                    //var current = moment(new Date());
                    //date = moment(new Date(date));
                    //return current.diff(date) > 0 ;

                    if(date.isPast(scheduleTime) && reminder.notificationChannels.push.value){
                        console.log('cleaning up reminder for task : '+task.name);

                        taskService.reminderDeleted(task.id, reminder.id);

                        reminderModel.delete(reminder.id, function(){

                        });

                        //if(isMobileDevice()){
                        //    addMobileReminder(task, reminder, scheduleTime)
                        //}
                        //else{
                        //    addWebReminder(task, reminder, scheduleTime);
                        //}
                    }
                }
            });
        }

        self.cleanUpReminders=function(){
            taskService.getAll().then(function(tasks){
                _.forEach(tasks,function(task){
                    if(task.status==dbEnums.status.active){
                        cleanUpReminderOfTask(task);
                    }

                });
            });
        }



    });
}).call(this);
