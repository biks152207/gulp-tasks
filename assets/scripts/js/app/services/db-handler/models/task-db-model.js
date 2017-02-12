(function(){
    app.service('taskModel', function( $window, $rootScope, userModel, TodoZuDB, dbEnums,$timeout){
        var self  = this;

        self.addOrUpdate = function(task,skipBroadcast, cb){
            if(typeof skipBroadcast=='function'){
                cb=skipBroadcast;
                skipBroadcast=false;
            }

            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("tasks", "readwrite");
                var store = tx.objectStore("tasks");
                //store.get(task.id).onsuccess=function(event){
                //    var oldTask=event.target.result;

                    store.put(task);
                    if(!skipBroadcast){
                        $rootScope.$emit('reminder:setReminders', task);
                    }

                    cb(null, task);
                    db.close();
                    //$timeout(function(){
                    //var hasChanged=oldTask?_.isEqual(oldTask||{},task):true;

                //    if(hasChanged){
                //        $rootScope.$emit('taskList-update');
                if(!skipBroadcast) {
                    taskListUpdateEvent();
                }
                //    }

                //}

                //});

            };

        };

        self.bulkUpdate = function(taskList, cb){

            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("tasks", "readwrite");
                var store = tx.objectStore("tasks");
                for(var i = 0;i< taskList.length; i++){

                    store.put(taskList[i]);
                    $rootScope.$emit('reminder:setReminders', taskList[i]);
                }
                cb();
                db.close();
                //$rootScope.$emit('taskList-update');
                taskListUpdateEvent();
            }
        };

        self.delete = function(id,skipBroadcast, cb){
            if(typeof skipBroadcast=='function'){
                cb=skipBroadcast;
                skipBroadcast=false;
            }

            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("tasks", "readwrite");
                var store = tx.objectStore("tasks");

                store.delete(id).onsuccess = function(event) {
                    if(cb){
                        cb(null,true);
                    }

                    if(!skipBroadcast){
                        $rootScope.$emit('taskList-update');
                    }

                };
                db.close();

            };
        };

        self.findActiveTaskById = function(id, cb){
            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("tasks", "readwrite");
                var store = tx.objectStore("tasks");

                store.get(id).onsuccess = function(event) {
                    if(event.target.result.status == dbEnums.status.active){
                        cb(null, event.target.result)
                    }
                    else cb(null,null);

                };
                db.close();

            };
        };
        self.findById = function(id, cb){

            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("tasks", "readwrite");
                var store = tx.objectStore("tasks");

                store.get(id).onsuccess = function(event) {
                    cb(null, event.target.result)
                };
                db.close();

            };

        };

        self.getAll = function(cb){

            var taskList = [];
            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("tasks", "readwrite");
                var store = tx.objectStore("tasks");
                store.openCursor().onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        if(cursor.value.status === dbEnums.status.active) taskList.push(cursor.value);
                        cursor.continue();
                    }
                    else {

                        cb(null, taskList);
                    }
                };
                db.close();

            };

        };

        self.getAllByPredicate=function(predicate,cb){
            predicate=predicate||function(){return true;};
            cb=cb||function(){};
            var taskList = [];
            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("tasks", "readwrite");
                var store = tx.objectStore("tasks");
                store.openCursor().onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        if(predicate(cursor.value)){
                            taskList.push(cursor.value);
                        }

                        cursor.continue();
                    }
                    else {

                        cb(null, taskList);
                    }
                };
                db.close();

            };
        }

        self.getAllIds = function(cb){

            var ids = [];
            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("tasks", "readwrite");
                var store = tx.objectStore("tasks");
                store.openCursor().onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        ids.push(cursor.value.id);
                        cursor.continue();
                    }
                    else {

                        cb(null, ids);
                    }
                };
                db.close();

            };

        };

        self.getSelected = function(ids, cb){

            var taskList = [];
            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("tasks", "readwrite");
                var store = tx.objectStore("tasks");
                store.openCursor().onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        if(ids.indexOf(cursor.value.id)> -1){
                            taskList.push(cursor.value);
                        }
                        cursor.continue();
                    }
                    else {

                        cb(null, taskList);
                    }
                };
                db.close();

            };

        };

        self.updateProjectInfo=function(project,cb){
            self.getAll(function(err,tasks){
                if(err)
                {
                    cb(err);
                    return;
                }

                _.each(tasks,function(task){
                    if(task.project && task.project.id===project.id){
                        task.project.name=project.name;
                        task.project.color=project.color;

                    }
                });

                self.bulkUpdate(tasks,cb);

            });
        }

        self.getTaskUserByRole=function(task,role){
            var assignee=_.find(task.users,function(usr){
                return usr.role === role && usr._id;
            });

            return assignee;
        }

        function setReminder(task){
            var loginId = userModel.getLoggedInId();
            if(task.status == dbEnums.status.active){
                task.reminders.forEach(function(reminder){
                    if(loginId == reminder.assignee._id){
                        $rootScope.$emit('reminder:add', task, reminder);
                    }
                });
            }
            else{
                task.reminders.forEach(function(reminder){
                    if(loginId == reminder.assignee._id){
                        $rootScope.$emit('reminder:delete', task, reminder);
                    }
                });
            }

        }

        var taskListUpdateEvent=ionic.debounce(function(){
            $rootScope.$emit('taskList-update');
        },500);



    });
}).call(this);
