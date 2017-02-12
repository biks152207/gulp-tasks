(function () {
    app.service('taskService', function ($q, $rootScope, $http, API, RESPONSE_CODE, connectivity, taskModel, sortService,
                                         labelService, userModel, filterService,guidGenerator, dbEnums, date, sync, dueService, message,
                                         toastService, $timeout, $ionicListDelegate, $state, sharedData, reminderModel, settingsService,helperService,roleValidators) {

        var self = this;

        var taskObject = angular.copy(sharedData.BASIC_TASK);
        var taskAddProject ;
        var bulkCompleteTasks = [];
        var bulkCompleteReturnState ;

        self.addAutoReminder=function(due_date){

            var settings = settingsService.getSettings();
            var autoReminder = null;
            if(settings.reminder.autoReminder.enable && due_date){
                autoReminder =  {
                    id: guidGenerator.getId(),
                    assignee: userModel.getLoggedInUser(),
                    date_created: new Date(),
                    updatedBy: userModel.getLoggedInUser(),
                    notificationChannels: settings.reminder.autoReminder.channels,
                    time: {
                        id:  0,
                        title: settings.reminder.autoReminder.time.title,
                        value: settings.reminder.autoReminder.time.value
                    },
                    auto:true
                };
            }
            return  autoReminder;
        }

        function blinkUpdatedTask(id){
            $rootScope.recentTaskId = id;
            //$timeout(function(){
            //    $rootScope.recentTaskId = undefined;
            //}, 1000);
        }

        function createTaskUser(user, getNotification, role, isAdmin){
            var taskUser = {
                _id: user._id,
                displayName: user.displayName,
                displayShortName: user.displayShortName,
                email: user.email,
                avatar: user.avatar,
                getNotification: getNotification,
                role : role,
                favourite: false
            };
            if(isAdmin) taskUser.isAdmin = true;

            return taskUser;
        }

        self.priorities = {
            0: {
                name: 'Priority 1',
                color: '#1775d2',
                number:0
            },
            1: {
                name: 'Priority 2',
                color: ' #6C6C6C',
                number:1
            },
            2:{
                name: 'Priority 3',
                color: '#BABABA',
                number:2
            },
            3:{
                name: 'Priority 4',
                number:3
            }
        };

        self.CHANNELS = {
            EMAIL: 'email',
            MOBILE: 'mobile',
            WEB: 'web'
        };

        self.TASK_TYPE_NAME = {
            inbox: 'Inbox',
            today: 'Today',
            next7days: 'Next 7 Days',
            overdue: 'Overdue',
            watching: 'Watching',
            favourites: 'Favourites',
            closed:'Closed'
        };

        self.add = function(task){
            var defer = $q.defer();

            task.id = guidGenerator.getId();
            task.status = dbEnums.status.active;
            task.date_created = new Date();
            task.date_modified = new Date();
            task.updatedBy = userModel.getLoggedInUser();
            var watchers = [];

            //Add Assignee
            if(task.assignee._id){
                var isAdmin = userModel.getLoggedInId() === task.assignee._id;
                watchers.push(createTaskUser(task.assignee, true,
                    dbEnums.taskUserRole.assignee, isAdmin));
            }
            //Add watchers
            task.watchers.forEach(function(object){
                if(object.watcher._id){
                    var isAdmin = userModel.getLoggedInId() === object.watcher._id;
                    var getNotification =  isAdmin  || object.checked;
                    var role = isAdmin ? dbEnums.taskUserRole.admin : dbEnums.taskUserRole.watcher ;

                    watchers.push(createTaskUser(object.watcher, getNotification,
                        role, isAdmin));
                }

            });
            //If No User Add only admin
            if(!watchers.length){

                var admin = userModel.getLoggedInUser();

                watchers.push(createTaskUser(admin, true,
                    dbEnums.taskUserRole.admin, true));
            }

            task.users = angular.copy(watchers);

            var user=userModel.getLoggedInUser();
            roleValidators.checkUserRole(user,[
                dbEnums.USER_ROLES.ACTIVE_TASKS,
                dbEnums.USER_ROLES.ASSIGNEE_PROJECT
            ],{task:task,user:user,project:task.project},true)
                .then(function(){

                    console.log('license check successful');
                    //return;

                    delete task.assignee;
                    delete task.watchers;

                    if(task.labels)  labelService.addTaskToLabels(task.labels, task.id);

                    var labelList = task.labels;
                    delete task.labels;

                    //var autoReminder = self.addAutoReminder(task.recurrence.due_date);
                    //if(autoReminder){
                    //    task.reminders.push(autoReminder);
                    //}

                    sync.add(dbEnums.collections.Task,{
                        task: task,
                        labels: labelList
                    } , dbEnums.events.Task.add);

                    taskModel.addOrUpdate(task, function(err, results){
                        blinkUpdatedTask(task.id);
                        defer.resolve(results);

                    });
                },function(err){
                    console.log('license check error');
                    console.log(err);
                    defer.reject(err);
                });

            return defer.promise;
        };

        self.copyTask=function(oldTask) {
            return $q(function (resolve, reject) {
                var user = userModel.getLoggedInUser();

                var task = angular.copy(oldTask);
                task.notes = [];
                delete task._id;
                delete task.id;
                task.id = guidGenerator.getId();
                task.status = dbEnums.status.active;
                task.date_created = new Date();
                task.date_modified = new Date();
                task.updatedBy = user;
                task.name = dbEnums.keys.COPY_TASK_PREFIX + task.name;

                var newTaskUsers = [];
                var oldTaskUsers = oldTask.users || [];
                _.each(oldTaskUsers, function (oldTaskUser) {
                    var isAdmin = oldTaskUser._id == user._id;
                    var role = oldTaskUser.role;
                    var newTaskUser = createTaskUser(oldTaskUser, oldTaskUser.getNotification, role, isAdmin);
                    newTaskUser.favourite = (isAdmin ? newTaskUser.favourite : false);
                    newTaskUsers.push(newTaskUser);
                });

                task.users = newTaskUsers;

                var labelsList = [];

                var asyncTask = $q(function (resolve, reject) {
                    labelService.getAll().then(function (labels) {
                        if (labels) {
                            labels.forEach(function (label) {
                                var labelExists = labelService.isTaskExists(oldTask.id, label);
                                if (labelExists) {
                                    labelsList.push({checked: true, 'label': label});
                                }

                            });
                            resolve();
                        }
                        else {
                            resolve();
                        }

                    }, reject);
                });

                asyncTask.then(function () {
                    //var autoReminder = addAutoReminder(task.recurrence.due_date);
                    task.reminders = task.reminders || [];
                    //if(autoReminder){
                    //    task.reminders.push(autoReminder);
                    //}


                    resolve(task);


                }, reject);

            });

        };


        self.bulkDueDateUpdate = function(data,preservePreviousTime,preservePreviousDate){

            var defer = $q.defer();
            taskModel.getSelected(data.taskIds, function(err, taskList){
                if(taskList){

                    self.updateDueDate(taskList,data.recurrence,preservePreviousTime,preservePreviousDate)
                        .then(defer.resolve,defer.reject);

                }
            });

            return defer.promise;
        };

        self.updateDueDate=function(taskList,recurrence,preservePreviousTime,preservePreviousDate){
            var defer = $q.defer();

            _.each(taskList,function(task){
                var prevDueDate=task.recurrence && task.recurrence.due_date?new Date(task.recurrence.due_date):null;
                task.recurrence =angular.copy(recurrence);
                if(task.recurrence && task.recurrence.due_date){
                    task.recurrence.due_date=new Date(task.recurrence.due_date);
                }

                if(preservePreviousTime && prevDueDate && task.recurrence.due_date){
                    task.recurrence.due_date.setHours(prevDueDate.getHours());
                    task.recurrence.due_date.setMinutes(prevDueDate.getMinutes());
                    task.recurrence.due_date.setSeconds(prevDueDate.getSeconds());
                    task.recurrence.due_date.setMilliseconds(prevDueDate.getMilliseconds());
                }

                if(preservePreviousDate && prevDueDate && task.recurrence.due_date){
                    task.recurrence.due_date.setFullYear(prevDueDate.getFullYear());
                    task.recurrence.due_date.setMonth(prevDueDate.getMonth());
                    task.recurrence.due_date.setDate(prevDueDate.getDate());

                }
                task.updatedBy = userModel.getLoggedInUser();
            });

            taskModel.bulkUpdate(taskList, function(){
                defer.resolve(true);
            });

            sync.add(dbEnums.collections.Task,
                {
                    taskList: taskList
                }, dbEnums.events.Task.bulkDueDateUpdate);


            //defer.resolve(true);

            return defer.promise;

        };

        self.bulkFavourites = function(data){
            var defer = $q.defer();
            taskModel.getSelected(data.taskIds, function(err, taskList){
                if(taskList){
                    taskList.forEach(function(task){
                        for(var i= 0;i<task.users.length; i++){
                            if(task.users[i]._id === userModel.getLoggedInId()){
                                task.users[i].favourite = data.isFavourite;
                                break;
                            }
                        }
                    });
                    sync.add(dbEnums.collections.Task,
                        {
                            isFavourite: data.isFavourite,
                            taskIds: data.taskIds,
                            userId: userModel.getLoggedInId()
                        }, dbEnums.events.Task.bulkFavourites);

                    taskModel.bulkUpdate(taskList, function(){
                        $rootScope.$emit('task:update-favourite', data.isFavourite);
                        defer.resolve(data.isFavourite);
                    })

                }
            });

            return defer.promise;
        };

        self.reminderDeleted = function(taskId, reminderId){

            var reminder ;

            var defer = $q.defer();
            taskModel.findById(taskId, function(err, task){
                for(var i=0;i<task.reminders.length; i++ ){
                     if(task.reminders[i].id == reminderId){

                         reminder =  angular.copy(task.reminders[i]);
                         task.reminders.splice(i, 1);
                        break;
                    }
                }
                if(reminder){
                    sync.add(dbEnums.collections.Task,{
                        task: task,
                        reminder: reminder
                    } , dbEnums.events.Task.deleteReminder);
                    taskModel.addOrUpdate(task, function(err, results){
                        defer.resolve(results);
                    });
                }
                else{
                    defer.resolve();
                }



            });
            return defer.promise;
        };

        self.reminderExecuted = function(taskId, reminderId){

            var reminder ;

            var defer = $q.defer();
            taskModel.findById(taskId, function(err, task){
                for(var i=0;i<task.reminders.length; i++ ){
                    if(task.reminders[i].id == reminderId){

                        reminder =  task.reminders[i];
                        reminder.notificationChannels.push.notified=true;
                        //task.reminders.splice(i, 1);
                        break;
                    }
                }
                sync.add(dbEnums.collections.Task,{
                    task: task,
                    reminder: reminder
                } , dbEnums.events.Task.deleteReminder);
                taskModel.addOrUpdate(task, function(err, results){
                    defer.resolve(results);
                });


            });
            return defer.promise;
        };

        self.removeTasksByProjectId = function(project){
            taskModel.getAll(function(err, list){
                list.forEach(function(task){
                    if(task.project.id == project.id){
                        taskModel.delete(task.id, function(err, success){
                            labelService.removeTaskFromAllLabels(task);
                        });
                    }
                });
            });
        };

        self.update= function(task, prevTask){
            var defer = $q.defer();

            if(angular.equals(task, prevTask)){
                defer.resolve(undefined);
            }
            else{
                task.updatedBy = userModel.getLoggedInUser();

                var watchers = [];

                //Add Assignee
                if(task.assignee){
                    var isAdmin = userModel.getLoggedInId() === task.assignee._id;
                    watchers.push(createTaskUser(task.assignee, true,
                        dbEnums.taskUserRole.assignee, isAdmin));
                }
                //Add watchers
                task.watchers.forEach(function(object){
                    if(object.watcher._id){
                        var isAdmin = userModel.getLoggedInId() === object.watcher._id;
                        //var getNotification =  isAdmin  || object.checked; // admin can opt out from watcher list. https://skyestream.atlassian.net/browse/TZ-524?focusedCommentId=26200&page=com.atlassian.jira.plugin.system.issuetabpanels:comment-tabpanel#comment-26200
                        var getNotification =  object.checked;
                        var role = isAdmin ? dbEnums.taskUserRole.admin : dbEnums.taskUserRole.watcher ;

                        watchers.push(createTaskUser(object.watcher, getNotification,
                            role, isAdmin));
                    }

                });
                //If No User Add only admin
                if(!watchers.length){

                    var admin = userModel.getLoggedInUser();
                    watchers.push(createTaskUser(admin, true,
                        dbEnums.taskUserRole.admin, true));
                }

                task.users = angular.copy(watchers);
                var user=userModel.getLoggedInUser();
                roleValidators.checkUserRole(user,[
                    dbEnums.USER_ROLES.ACTIVE_TASKS,
                    dbEnums.USER_ROLES.ASSIGNEE_PROJECT],{task:task,user:user,project:task.project},true)
                    .then(function() {
                        //defer.resolve();
                        //return;

                        delete task.assignee;
                        delete task.watchers;

                        if (task.labels)  labelService.addTaskToLabels(task.labels, task.id);

                        var labelList = task.labels;
                        delete task.labels;

                        //set recurrence
                        if (!_.isEqual(task.prevRecurrence, task.recurrence)) {
                            task.recurrence = dueService.setDueDate(task.recurrence);
                        }

                        delete task.prevRecurrence;
                        //remove previous reminder from web reminder DB
                        task.removeReminders.forEach(function (id) {
                            reminderModel.delete(id, function () {
                            });
                        });

                        task.date_modified = new Date();
                        sync.add(dbEnums.collections.Task, {
                            task: task,
                            labels: labelList
                        }, dbEnums.events.Task.update);
                        taskModel.addOrUpdate(task, function (err, results) {

                            blinkUpdatedTask(task.id);
                            defer.resolve(results);
                        });
                    },defer.reject);
            }

            return defer.promise;
        };

        self.updateItem = function(item) {

            if(item.status === dbEnums.status.deleted){
                taskModel.delete(item.id, function(err, isDeleted){});
            }
            else{
                taskModel.addOrUpdate(item, function(err, task){});
            }
        };

        self.findActiveTaskById = function (id) {
            var defer = $q.defer();
            taskModel.findActiveTaskById(id, function(err, task){

                defer.resolve(task);
            });
            return defer.promise;
        };

        self.findById = function (id) {
            var defer = $q.defer();
            taskModel.findById(id, function(err, task){

                defer.resolve(task);
            });
            return defer.promise;
        };

        self.getAll = function () {
            var defer = $q.defer();
            taskModel.getAll(function(err, list){
                defer.resolve(list)

            });
            return defer.promise;
        };

        self.getTasksByIds=function(ids){
            var defer = $q.defer();
            taskModel.getAllByPredicate(function(task) {
                var isTrue=false;
                var _id= _.find(ids,function(id){
                   return id== task.id;
                });

                return _id;

            },function(err, list){
                    defer.resolve(list)


            });
            return defer.promise;

        }

        self.taskCount = function(){
            var defer = $q.defer();
            taskModel.getAll(function(err, list){
                defer.resolve(list.length)

            });
            return defer.promise;
        };

        self.setTaskObject = function(task){
            taskObject = task;
        };

        self.getTaskObject = function(){
            if(taskAddProject){
                taskObject.project = taskAddProject;
            }
          return taskObject;
        };

        self.clearTaskObject = function(){
            taskObject = angular.copy(sharedData.BASIC_TASK);
            taskAddProject = undefined;
        };

        self.taskObjectHasValue = function(){
            return taskObject.name || taskObject.notes.length ;
        };


        self.getTasksByType = function (type,  object) {

            var tasks = [];
            var defer = $q.defer();

            self.getAll().then(function(taskList){

                taskList.forEach(function(task){
                    var t = angular.copy(task);
                    console.log('task...', t);
                    if (self.taskType[type](task, object)) {

                        task.due = date.getDateOnly(task.recurrence.due_date) || new Date('01/01/2050');
                        task.recurrence.due_time = date.getTime(task.recurrence.due_date);
                        task.due_time = date.getTime(task.recurrence.due_date);
                        task.isOverdued = date.isPastDay(task.recurrence.due_date);
                        task.assignee = self.getAssignee(task);
                        console.log('conversion..', task);
                        tasks.push(task);
                    }
                });
                var sortType = sortService.getSortType() ;
                sortType=sortType|| sortService.DEFAULT_SORT;
                var order =  sortService.getOrder().value;
                $rootScope.showDateBar = sortType?sortType.showDateBar :false;

                userModel.get(function(user){
                    tasks=self.sortTasks(tasks,sortType,order,user);
                    defer.resolve(tasks);
                });
                //if(sortType.value=='custom'){
                //
                //}
                //else{
                //    tasks = _.orderBy(tasks, [sortType.value, 'priority'], [order, 'asc']);
                //}
                //
                //defer.resolve(tasks);
            });

            return defer.promise;
        };

        self.isUserAnAdmin = function (task, userId) {

            for (var i = 0; i < task.users.length; i++) {

                if (task.users[i]._id === userId && task.users[i].isAdmin) return true;
            }
            return false;
        };

        self.isUserAnAssignee = function (task, userId) {

            if (!task.project.id && self.isUserAnAdmin(task, userId)) return true;
            for (var i = 0; i < task.users.length; i++) {
                if (task.users[i].role === dbEnums.taskUserRole.assignee && task.users[i]._id === userId) {
                    return true;
                }
            }
            return false;
        };

        self.getTaskUserByRole=function(task,role){
            var assignee=_.find(task.users,function(usr){
                return usr.role === role;
            });

            return assignee;
        }

        self.isUserAWatcher = function (task, userId) {

            for (var i = 0; i < task.users.length; i++) {

                if (task.users[i].getNotification && task.users[i]._id === userId){
                    return true;
                }
            }
            return false;
        };

        self.isFavourite = function (task, userId) {

            for (var i = 0; i < task.users.length; i++) {
                if (task.users[i]._id === userId){
                    return task.users[i].favourite;
                }
            }
            return false;
        };

        self.getAssignee = function(task){

            for (var i = 0; i < task.users.length; i++) {
                if (task.users[i].role === dbEnums.taskUserRole.assignee){
                    return task.users[i];
                }
            }
            return null;
        };

        self.taskType = {

            inbox: function (task) {
                return !task.project.id && task.status == dbEnums.status.active;
            },
            today: function (task) {
                return date.isToday(task.recurrence.due_date) && self.isUserAnAssignee(task, userModel.getLoggedInId()) && task.status == dbEnums.status.active;
            },
            next7days: function (task) {
                // using day value 8. Because it takes today and next 7 days. In total 8 days.
                return date.isInNextNDays(task.recurrence.due_date, 8) && self.isUserAnAssignee(task, userModel.getLoggedInId()) && task.status == dbEnums.status.active;
            },
            overdue: function (task) {
                return date.isPastDay(task.recurrence.due_date) && self.isUserAnAssignee(task, userModel.getLoggedInId()) && task.status == dbEnums.status.active;
            },
            watching: function (task) {
                return self.isUserAWatcher(task, userModel.getLoggedInId()) && task.status == dbEnums.status.active;
            },
            favourites: function (task) {
                return self.isFavourite(task, userModel.getLoggedInId()) && task.status == dbEnums.status.active;
            },
            assignee: function (task, assignee) {
                return assignee && self.isUserAnAssignee(task, assignee._id) && task.status == dbEnums.status.active;
            },
            label: function (task, label) {
                 return label && labelService.isTaskExists(task.id, label) && task.status == dbEnums.status.active;
            },
            filter: function(task, filter){
                return filter && filterService.isTaskExists(task, filter) && task.status == dbEnums.status.active;
            },
            project: function (task, project) {

                return project && task.project.id == project.id && task.status == dbEnums.status.active;
            },
            closed:function(task){
                return task.status==dbEnums.status.closed;
            },
            //all tasks
            '': function (task) {
                return  task.status == dbEnums.status.active;
            }
        };


        self.addProjectToTaskObject = function(project){
            if(project){
                taskAddProject = {
                        id: project.id,
                        name: project.name,
                        color: project.color
                }
            }
        };

        self.getActiveReminders=function(task){
            var reminders=[];
            if(task.reminders){
                task.reminders.forEach(function(reminder){
                    var isActive=self.isReminderActive(task,reminder);
                    if(isActive) {
                        reminders.push(reminder);
                    };
                });
            }

            return reminders;
        };

        self.countActiveReminders=function(task){
            var reminders=self.getActiveReminders(task);
            return reminders.length;
        };

        self.isReminderActive=function(task,reminder){

            var scheduleTime = helperService.getScheduledTime(reminder, task.recurrence.due_date);

            var isActive=false;
            var emailNotified=true;
            var pushNotified=true;
            if(reminder.notificationChannels.email){
                if(reminder.notificationChannels.email.value && !reminder.notificationChannels.email.notified){
                    //isActive=true;
                    emailNotified=false;
                }
            }

            if(reminder.notificationChannels.push){
                if(reminder.notificationChannels.push.value && !reminder.notificationChannels.push.notified){
                    //isActive=true;
                    pushNotified=false;
                }
            }

            if(!pushNotified||!emailNotified){

                isActive=true;
            }

            return isActive;
            //return (!reminder.notificationChannels.email || !reminder.notificationChannels.email.value ||!reminder.notificationChannels.email.notified)
            //    && (!reminder.notificationChannels.push || !reminder.notificationChannels.push.value ||!reminder.notificationChannels.push.notified)
            //;
        };

        self.getCompletedTasks=function(opt){
            var data=angular.extend({

                    limit: 25,
                    skip: 0

            },opt);

            var defer = $q.defer();
            if(connectivity.isConnected()){

                //var userId = userModel.getLoggedInId();
                //console.log('getCompletedTasks----opt---');
                //console.log(opt);
                //console.log('getCompletedTasks----data---');
                //console.log(data);
                $http.get(API.task.GET.getCompleted , {params:data})
                    .success(function (results) {
                        if(results.response_code === RESPONSE_CODE.SUCCESS){
                            results.data.completedTasks.forEach(function(task){
                                task.due = date.getDateOnly(task.recurrence.due_date) || new Date('01-01-2050');
                                task.recurrence.due_time = date.getTime(task.recurrence.due_date);
                                task.due_time = date.getTime(task.recurrence.due_date);
                                task.isOverdued = date.isPastDay(task.recurrence.due_date);
                                task.assignee = self.getAssignee(task);
                                //tasks.push(task);
                            });
                            defer.resolve(results.data.completedTasks);
                        }
                        else if (results.response_code === RESPONSE_CODE.ERROR) {

                            defer.reject({
                                error:true,
                                msg: message.errorMessages[results.errors.value],
                                results: results
                            });
                        }
                    })
                    .error(function (results) {
                        defer.reject({
                            error:true,
                            msg: message.errorMessages.GENERAL,
                            results: results
                        });
                    });


            }
            else{
                defer.reject({
                    error:true,
                    msg: message.errorMessages.CONNECTION_REQUIRED
                });
            }
            var promise=defer.promise;
            //console.log(promise);
            return promise;

        };

        self.unCompleteTasks=function(tasks) {
            var defer = $q.defer();
            var allTasks = _.isArray(tasks) ? tasks : [tasks];
            //userModel.getLoggedInId();
            var data = allTasks;
            var user = userModel.getLoggedInUser();
            var asyncTasks = $q(function (resolve, reject) {
                resolve();
            });
            _.each(allTasks, function (task) {
                asyncTasks = asyncTasks.then(function () {
                    return roleValidators.checkUserRole(user, dbEnums.USER_ROLES.ACTIVE_TASKS, {
                        project: task.project,
                        user: user
                    }, true);
                });
            });
            asyncTasks
                .then(function () {
                    return $q(function(resolve,reject){
                        if (connectivity.isConnected()) {


                            $http.post(API.task.unCompleteTasks, data)
                                .success(function (results) {
                                    if (results.response_code === RESPONSE_CODE.SUCCESS) {

                                        //$rootScope.$emit('taskList-update');

                                        self.addTaskFromServer(results.data.tasks)
                                            .then(function () {
                                                resolve(results.data.tasks ? results.data.tasks : tasks);
                                                $rootScope.$emit('task-reopen', results.data.tasks);
                                            }, reject);


                                    }
                                    else {
                                        reject({
                                            error: true,
                                            msg: message.errorMessages[results.errors.value],
                                            results: results
                                        });
                                    }
                                })
                                .error(function (results) {
                                    reject({
                                        error: true,
                                        msg: message.errorMessages.GENERAL,
                                        results: results
                                    });
                                });

                        }
                        else {
                            reject({error: true, msg: message.errorMessages.CONNECTION_REQUIRED});
                        }
                    });

                })
                .then(defer.resolve,defer.reject);
            return defer.promise;

        }

        self.addTaskFromServer=function(tasks){
            var defer=$q.defer();
            var promises=[];
            //angular.forEach(tasks,function(task,i){
                //promises.push($q(function(resolve,reject){
            taskModel.bulkUpdate(tasks, function(err, results){
                if(err){
                    defer.reject(err);
                    //return false;
                }

                defer.resolve(tasks);
            },defer.reject);
                //}));
            //})

            //$q.all(promises)
            //    .then(defer.resolve,defer.reject);


            return defer.promise;
        }

        self.getTaskFromServer=function(taskId){
            var defer=$q.defer();
            if(connectivity.isConnected()){
                $http.get(API.task.GET.view+taskId)
                    .then(function(results){
                        defer.resolve(results.data.data.task);

                    },function(err){
                        defer.reject({error:true,msg:message.errorMessages.GENERAL});

                    });
            }
            else{
                defer.reject({error:true,msg:message.errorMessage.CONNECTION_REQUIRED});
            }


            return defer.promise;
        };

        self.moveTask=function(tasks,fromIndex,toIndex,closestIndex,user,updateDate,sortType,order){

            var defer=$q.defer();
            var task1=tasks[fromIndex];
            //var task2=tasks[toIndex];
            var topItem,bottomItem;
            var shouldUpdateDueDate=false;
            var newList=tasks;//angular.copy(tasks);

            if(fromIndex<toIndex){
               topItem=tasks[toIndex];
                if(toIndex+1<tasks.length){
                    bottomItem=tasks[toIndex+1];
                }

            }
            else if(fromIndex>toIndex){
                bottomItem=tasks[toIndex];
                if(toIndex-1>=0){
                    topItem=tasks[toIndex-1];
                }
            }
            else{
                if(fromIndex<closestIndex){
                    topItem=tasks[toIndex-1];
                    if(toIndex+1<tasks.length){
                        bottomItem=tasks[toIndex+1];
                    }
                }
                else if(fromIndex>closestIndex){
                    bottomItem=tasks[toIndex-1];
                    if(toIndex-1>=0){
                        topItem=tasks[toIndex-1];
                    }
                }
                //defer.resolve({tasks:newList});
                //return defer.promise;
                //return tasks;
            }

            var prevDueDate;

            if(updateDate){
                var closestTask=tasks[closestIndex];
                var areGroupHeaderEqual=self.areDateGroupEqual(task1,closestTask);
                if(!areGroupHeaderEqual){
                    var oldRecurrence=task1.recurrence;
                    prevDueDate=oldRecurrence && oldRecurrence.due_date?new Date(oldRecurrence.due_date):null;
                    task1.recurrence=angular.copy(closestTask.recurrence);
                    if(task1.recurrence && task1.recurrence.due_date){
                        task1.recurrence.due_date=new Date(task1.recurrence.due_date);
                        task1.recurrence.due_date.setHours(0);
                        task1.recurrence.due_date.setMinutes(0);
                        task1.recurrence.due_date.setSeconds(0);
                        task1.recurrence.due_date.setMilliseconds(0);
                    }


                    shouldUpdateDueDate=true;
                }
            }

            var withTopItem=1;
            var withBottomItem=-1;
            if(topItem){
                var ord=sortType && sortType.value=="plan"?
                    1
                    :self.compareTasks(task1,topItem,user,shouldUpdateDueDate,sortType,order);
                withTopItem=ord;
            }

            if(bottomItem){
                var ord=sortType && sortType.value=="plan"?
                    -1
                    :self.compareTasks(task1,bottomItem,user,shouldUpdateDueDate,sortType,order);
                withBottomItem=ord ;
            }

            var canMove=withTopItem>=0 && withBottomItem<=0;
            if(!canMove && sortType.value=="priority"){
                if(fromIndex<toIndex){
                    canMove=withTopItem>=0;
                }
                else if(fromIndex>toIndex){
                    canMove=withBottomItem<=0;
                }
            }


            if(canMove){
                console.log('step 2');
                //we can move
                //newList.splice(fromIndex,1);
                //if(fromIndex<toIndex){
                //newList.splice(toIndex,0,task1);
                //defer.resolve({tasks:tasks,reSort:shouldUpdateDueDate});

               //$timeout(function(){
                   //return;
                $q(function(resolve,reject){
                    if(shouldUpdateDueDate) {
                        if(prevDueDate && task1.recurrence && task1.recurrence.due_date){

                            task1.recurrence.due_date.setHours(prevDueDate.getHours());
                            task1.recurrence.due_date.setMinutes(prevDueDate.getMinutes());
                            task1.recurrence.due_date.setSeconds(prevDueDate.getSeconds());
                            task1.recurrence.due_date.setMilliseconds(prevDueDate.getMilliseconds());
                        }


                        console.log('step 3');
                        self.updateDueDate([task1], task1.recurrence)
                            .then(function () {
                                resolve();

                            },reject);
                    }
                    else{
                        resolve();
                    }
                })
                .then(function(){
                        var deferResolved=false;
                        if(!shouldUpdateDueDate){
                            //newList.splice(fromIndex,1);
                            newList.splice(fromIndex,1);
                            newList.splice(toIndex,0,task1);
                            deferResolved=true;
                            defer.resolve({tasks:newList});

                        }
                        console.log('step 4');
                    self.saveTaskCustomOrder(task1,topItem,bottomItem,user,sortType,order)
                        .then(function(){
                            console.log('step 5');

                            //

                            if(!deferResolved){
                                defer.resolve({tasks:newList,requireSort:true});
                            }


                            //defer.resolve(newList);
                            //if(shouldUpdateDueDate) {
                            //    self.updateDueDate([task1], task1.recurrence)
                            //        .then(function () {
                            //            defer.resolve(newList);
                            //
                            //        });
                            //}
                            //else{
                            //    // defer.resolve(newList);
                            //}

                        }
                        ,function(){
                            if(!deferResolved){
                                defer.reject();
                            }
                        }
                    );
                });
                   //self.saveTaskCustomOrder(task1,topItem,bottomItem,user)
                   //    .then(function(){
                   //        newList.splice(fromIndex,1);
                   //        //
                   //        newList.splice(toIndex,0,task1);
                   //
                   //        //defer.resolve(newList);
                   //        if(shouldUpdateDueDate) {
                   //            self.updateDueDate([task1], task1.recurrence)
                   //                .then(function () {
                   //                    defer.resolve(newList);
                   //
                   //                });
                   //        }
                   //        else{
                   //            // defer.resolve(newList);
                   //        }
                   //
                   //    });
               //});


                //}
            }
            else{
                defer.resolve({tasks:null});
            }


            return defer.promise;

            //if((toIndex-1)<)
        }

        self.saveTaskCustomOrder=function(task,topItem,bottomItem,user,sortType,order){
            var defer = $q.defer();
            self.getAll()
                .then(function(tasks){

                    tasks.forEach(function(task){

                        task.due = date.getDateOnly(task.recurrence.due_date) || new Date('01-01-2050');
                        task.recurrence.due_time = date.getTime(task.recurrence.due_date);
                        task.due_time = date.getTime(task.recurrence.due_date);

                    });

                    var sortedTasks=self.sortTasks(tasks,sortType,order,user);
                    //
                    //    tasks.sort(function(task1,task2){
                    //    var ord= self.customOrderCompareTasks(task1,task2,user);
                    //    return ord * (order=="desc"?-1:1);
                    //});



                    var idxOfTask= _.findIndex(sortedTasks,function(tsk){
                       return tsk.id==task.id;
                    });
                    var idxOfTop=!topItem?-1: _.findIndex(sortedTasks,function(tsk){
                        return tsk.id==topItem.id;
                    });
                    var idxOfBottom=!bottomItem?-1: _.findIndex(sortedTasks,function(tsk){
                        return tsk.id==bottomItem.id;
                    });
                    var thisTask=sortedTasks.splice(idxOfTask,1)[0];
                    if(idxOfTop>=0){
                        if(idxOfTask>idxOfTop){
                            sortedTasks.splice(idxOfTop+1,0,thisTask);
                        }
                        else{
                            sortedTasks.splice(idxOfTop,0,thisTask);
                        }
                    }
                    else if(idxOfBottom>=0){
                        if(idxOfTask>idxOfBottom){
                            sortedTasks.splice(idxOfBottom,0,thisTask);
                        }
                        else{
                            sortedTasks.splice(idxOfBottom-1,0,thisTask);
                        }
                    }

                    var orders=[];
                    var orderNum=1;

                    _.each(sortedTasks,function(task){
                        orders.push({'taskId':task.id,'order':orderNum++});

                    });
                    console.log('sorted task');
                    console.log(_.map(sortedTasks,function(tsk){
                        return tsk.name;
                    }).join(' , '));


                    //user.taskCustomOrders=orders;

                    //userModel.addOrUpdate(user,function(err,newUser){
                    //    defer.resolve();
                    //
                    //});
                    userModel.setTaskCustomOrders(orders);

                    sync.add(dbEnums.collections.User,
                        {
                            user: user,
                            taskCustomOrder: orders
                        }, dbEnums.events.Task.moveTaskOrder);

                    defer.resolve();

                });

            return defer.promise;



        }


        self.sortTasks=function(tasks,sortType,order,user){
            var newTasks;
            if(sortType.value=='plan'){
                //console.clear();
                //console.log('----sorting tasks plan view----');
                //console.log(_.map(tasks,function(task){
                //    return task.name;
                //}).join(','));

                newTasks=tasks.sort(function(task1,task2){
                    var ord= customOrderComparer(task1,task2,user,sortType,order);
                    return ord ;
                });
                //console.log(_.map(newTasks,function(task){
                //    return task.name;
                //}).join(','));


            }
            else{
                newTasks=tasks.sort(function(task1,task2){
                    var result=customOrderComparer(task1,task2,user,sortType,order);
                    return result ;
                });

                var priorityOrder=(order=="asc"?"desc":"asc");
                var newOrder=(sortType.value=="priority"?priorityOrder:order);
                if(sortType.value=="priority"){
                    newTasks = _.orderBy(newTasks, ['priority','due','due_time'], [priorityOrder,order,order]);
                }
                else{
                    newTasks = _.orderBy(newTasks, [sortType.value,'due','due_time', 'priority'], [newOrder,newOrder,newOrder, "asc"]);
                }


            }

            return newTasks;
            //var orderedResult=_tasks.
        };

        self.customOrderCompareTasks=function(task1,task2,user,sortType,order){
            if(!task1 && !task2){
                return 0;
            }
            else if(!task1){
                return -1;
            }
            else if(!task2){
                return 1;
            }
            var dueDateCompareResult;

            dueDateCompareResult=dueDateComparer(task1,task2);
            var logStr='date compare result '+dueDateCompareResult;

            if(dueDateCompareResult==0){
                var priorityCompareResult=priorityComparer(task1,task2);
                logStr=logStr+';;;priority compare result '+priorityCompareResult;
                if(priorityCompareResult==0){
                    var customOrderResult=customOrderComparer(task1,task2,user);
                    logStr=logStr+';;;custom order compare result '+customOrderResult;
                    //console.log(logStr);
                    return customOrderResult;
                }
                //console.log(logStr);
                return priorityCompareResult * (order=="asc"?1:-1);
            }
            else{
                //console.log(logStr);
                return dueDateCompareResult * (order=="asc"?1:-1);
            }


        };

        self.compareTasks=function(task1,task2,user,isMovingDueDate,sortType,order){
            if(task1==null && task2==null){
                return 0;
            }
            else if(task1==null){
                return -1;
            }
            else if(task2==null){
                return 1;
            }

            var newOrder=order;
            if(sortType.value=='due'){
                newOrder="desc";
            }
            var dueDateCompareResult;

            //dueDateCompareResult=sortType.value=='due'?dueDateComparer(task1,task2):0;
            dueDateCompareResult=dueDateComparer(task1,task2);
            var priorityCompareResult=priorityComparer(task1,task2);
            if(sortType.value=="priority" && !isMovingDueDate){
                if(priorityCompareResult==0){
                    return dueDateCompareResult * (order=='asc'?1:-1);
                }
                else{
                    return priorityCompareResult * (newOrder=='asc'?1:-1);
                }
            }
            else{
                if(dueDateCompareResult==0 && !isMovingDueDate){

                    return priorityCompareResult * (newOrder=='asc'?1:-1);
                }
                else{
                    return dueDateCompareResult * (order=='asc'?1:-1);
                }
            }
            //if(dueDateCompareResult==0 && !isMovingDueDate){
            //    var priorityCompareResult=priorityComparer(task1,task2);
            //
            //
            //    return priorityCompareResult * (newOrder=='asc'?1:-1);
            //}
            //else{
            //    return dueDateCompareResult * (order=='asc'?1:-1);
            //}


        };

        function dueDateComparer(task1,task2) {
            if (!task1.recurrence.due_date && !task2.recurrence.due_date) {
                return 0;
            }
            else if (!task1.recurrence.due_date) {
                return 1;
            }
            else if (!task2.recurrence.due_date) {
                return -1;
            }
            else {
                var dueDate1 = moment(task1.recurrence.due_date);
                var dueDate2 = moment(task2.recurrence.due_date);
                if (dueDate1 < dueDate2) {
                    return -1;
                }
                else if (dueDate1 > dueDate2) {
                    return 1;
                }
                else {

                    return 0;
                }
                //return 1;
            }
        }

        function priorityComparer(task1,task2){
            if(task1.priority==task2.priority){
                return 0;
            }
            else if(task1.priority<task2.priority){
                return 1;
            }
            else {
                return -1;
            }
        }

        function customOrderComparer(task1,task2,user,sortType,order){
            var customOrder=userModel.getTaskCustomOrders();
            var result1=customOrderComparerFromUser(task1,task2,user,customOrder,sortType,order);

            return result1;
        }

        function customOrderComparerFromUser(task1,task2,user,taskCustomOrders,sortType,order){
            var existingCustomOrder= _.find(taskCustomOrders||[],function(order){
               return task1.id==order.taskId;
            });
            var existingCustomOrder2=_.find(taskCustomOrders||[],function(order){
                return task2.id==order.taskId;
            });

            if(!existingCustomOrder && !existingCustomOrder2){
                return 0;
            }
            else if(!existingCustomOrder){
                return 1;
            }
            else if(!existingCustomOrder2) {
                return -1;
            }
            else{
                return existingCustomOrder.order-existingCustomOrder2.order;

            }


        }

        self.areDateGroupEqual=function(task1,task2){
            var due_date1=task1.recurrence.due_date;
            var due_date2=task2.recurrence.due_date;
            var due_date_comparision=dueDateComparer(task1,task2);
            if(due_date_comparision){
                var groupHeader1=date.getDateGroupHeader(due_date1);
                var groupHeader2=date.getDateGroupHeader(due_date2);
                return groupHeader1==groupHeader2;

            }
            else{
                return true;
            }
        };

        self.bulkCompleteRequest = function(taskList, isMobile, returnState){
            var defer=$q.defer();
            if($rootScope.rightDefaultViewVisible){
                $rootScope.$emit('task:bulkCompleted');
            }
            //taskModel.getSelected(list, function(err, taskList){

            if(taskList){
                //var tskList= angular.copy(taskList);
                bulkCompleteTasks=bulkCompleteTasks||[];
                var hadTasks=bulkCompleteTasks.length>0;
                bulkCompleteTasks=bulkCompleteTasks.concat(taskList);

                if(!isMobile){
                    toastService.openTaskCompleteToast();
                    bulkCompleteReturnState = returnState;
                    _.each(taskList,function(task){
                        taskModel.delete(task.id,true);

                    });
                    $rootScope.$emit('taskList-update');
                    //taskList.forEach(function(task){
                    //    task.status =  dbEnums.status.complete;
                    //});
                    //taskModel.bulkUpdate(taskList, function(){
                    //    defer.resolve();
                    //});
                    defer.resolve();
                }
                else{
                    defer.resolve();
                }
            }
            else{
                defer.resolve();
            }
            //});

            return defer.promise;
        };

        self.removeFromBulkCompleteList=function(item){
            bulkCompleteTasks=bulkCompleteTasks||[];
            _.remove(bulkCompleteTasks,function(task){
                return task.id==item.id;
            });
            taskModel.addOrUpdate(item,function(){

            });
        };

        $rootScope.$on('bulk-complete:response',function(event, isUndo){
            if(isUndo){
                _.each(bulkCompleteTasks,function(task){
                    task.status=dbEnums.status.active;
                    taskModel.addOrUpdate(task,true,function(){

                    });
                });

                $rootScope.$emit('taskList-update');

                console.log('undo bulk complete ');
                console.log(_.map(bulkCompleteTasks,function(tsk){return tsk.name;}));
                if(bulkCompleteReturnState){
                    $state.go(bulkCompleteReturnState.name, bulkCompleteReturnState.params);
                }

                //taskModel.getSelected(list, function(err, taskList){
                //    taskModel.bulkUpdate(taskList, function(){
                //
                //        if(bulkCompleteReturnState){
                //            $state.go(bulkCompleteReturnState.name, bulkCompleteReturnState.params);
                //        }
                //        //$rootScope.$emit('taskList-update');
                //
                //
                //    });
                //
                //
                //});
                $ionicListDelegate.closeOptionButtons();

            }
            else {
                var taskIds = [];
                if(bulkCompleteTasks.length){
                    bulkCompleteTasks.forEach(function(task){
                        taskIds.push(task.id);
                    });
                    self.bulkComplete(bulkCompleteTasks).then(function () {

                        //$rootScope.$emit('taskList-update');
                        //$ionicListDelegate.closeOptionButtons();
                    })  ;
                    console.log('---completing tasks--');
                    console.log(_.map(bulkCompleteTasks,function(tsk){return tsk.name;}));
                }
            }
            bulkCompleteTasks = [];
           // $ionicListDelegate.closeOptionButtons();

        });

        self.bulkComplete = function(taskList){
            var defer = $q.defer();
            //taskModel.getSelected(taskIds, function(err, taskList){
            if(taskList){
                var date_modified = new Date();
                taskList.forEach(function(task){
                    task.recurrence = dueService.setDueDate(task.recurrence, date_modified);
                    task.status = task.recurrence.isRecurring ? dbEnums.status.active : dbEnums.status.complete;
                    task.date_modified = date_modified;
                    task.updatedBy = userModel.getLoggedInUser();
                });
                sync.add(dbEnums.collections.Task,
                    {
                        taskList: taskList,
                        userId: userModel.getLoggedInId()
                    }, dbEnums.events.Task.bulkComplete);

                taskModel.bulkUpdate(taskList, function(){
                    defer.resolve(true);

                });

            }
            //});
            return defer.promise;
        };


        self.setTaskProps=function(task){

            task.due = date.getDateOnly(task.recurrence.due_date) || new Date('01-01-2050');
            task.recurrence.due_time = date.getTime(task.recurrence.due_date);
            task.isOverdued = date.isPastDay(task.recurrence.due_date);
            task.assignee = self.getAssignee(task);
            //tasks.push(task);


            return task;
        };

        self.delete=function(tasks,callback){
            var taskIds= _.map(tasks,function(tsk){
               return tsk.id;
            });
            var user=userModel.getLoggedInUser();

            sync.add(dbEnums.collections.Task,
                {
                    taskIds: taskIds,
                    updatedBy:user
                }, dbEnums.events.Task.delete);

            _.each(taskIds,function(taskId){
               taskModel.delete(taskId,function(){
                    callback();
               });
            });

        };

        self.sendProjectAdminInvitation=function(project){
            //var user=
        }


    });


}).call(this);
