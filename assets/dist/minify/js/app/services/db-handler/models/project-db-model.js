(function(){
    app.service('projectModel', ["$rootScope", "userModel", "dbEnums", "TodoZuDB", "taskModel", function($rootScope, userModel, dbEnums, TodoZuDB,taskModel){
        var self  = this;

        self.addOrUpdate = function(project, cb){

            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("projects", "readwrite");
                var store = tx.objectStore("projects");
                store.put(project);
                taskModel.updateProjectInfo(project,function(){

                });
                cb(null, project);
                db.close();
                //$rootScope.$emit('projectList-update', project);
                projectListUpdateEvent();

            };

        };


        self.bulkUpdate = function(projectList,skipEvent, cb){
            if(typeof skipEvent=='function'){
                cb=skipEvent;
                skipEvent=false;

            }
            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("projects", "readwrite");
                var store = tx.objectStore("projects");
                for(var i = 0;i< projectList.length; i++){
                    store.put(projectList[i]);
                }

                if(!skipEvent){
                    projectListUpdateEvent();
                }

                cb();
                db.close();

            }
        };

        self.getAll = function(cb){
            taskModel.getAll(function(err,tasks){
                tasks=tasks||[];
                var projectList = [];
                var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
                open.onsuccess = function() {
                    var db = open.result;
                    var tx = db.transaction("projects", "readwrite");
                    var store = tx.objectStore("projects");
                    store.openCursor().onsuccess = function(event) {
                        var cursor = event.target.result;
                        if (cursor) {
                            cursor.value.users.forEach(function(user){
                                if(user._id ==userModel.getLoggedInId() && user.status === dbEnums.status.active && cursor.value.status == dbEnums.status.active){
                                    cursor.value.order = user.order;
                                    cursor.value.tasksCount=0;
                                    tasks.forEach(function(task){
                                       if(task.project && task.project.id===cursor.value.id){
                                           cursor.value.tasksCount+=1;
                                       }
                                    });
                                    projectList.push(cursor.value);
                                }
                            });

                            cursor.continue();
                        }
                        else {

                            cb(null, _.sortBy(projectList, 'order'));
                        }
                    };
                    db.close();

                };
            });



        };

        self.getUserCreatedActiveProjects=function(userId,cb){
            self.getUserCreatedProjects(userId,function(err,projects){
                if(err) cb(err);
                else{

                    var activeProjects=_.filter(projects,function(project){
                        var isValidProject=false;
                        if(project.status == dbEnums.status.active){
                            isValidProject=true;
                        }

                        //project.users.forEach(function(user){
                        //    if(project.status == dbEnums.status.active){
                        //        isValidProject=true;
                        //    }
                        //
                        //    //return !isValidProject;
                        //});
                        return isValidProject;
                    });
                    cb(null,activeProjects);
                }
            });
        };

        self.getUserCreatedProjects=function(userId,cb){
            var projectList=[];
            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("projects", "readwrite");
                var store = tx.objectStore("projects");
                store.openCursor().onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        cursor.value.users.forEach(function(user){
                            if(user._id ==userId && user.isAdmin==true ){
                                cursor.value.order = user.order;
                                //cursor.value.tasksCount=0;

                                projectList.push(cursor.value);
                            }
                        });

                        cursor.continue();
                    }
                    else {

                        cb(null, _.sortBy(projectList, 'order'));
                    }
                };
                db.close();

            };
        }

        self.getAllArchived = function(cb){

            var projectList = [];
            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("projects", "readwrite");
                var store = tx.objectStore("projects");
                store.openCursor().onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        cursor.value.users.forEach(function(user){
                            if(user._id ==userModel.getLoggedInId() && user.status === dbEnums.status.archived){
                                projectList.push(cursor.value);
                            }
                        });

                        cursor.continue();
                    }
                    else {

                        cb(null, projectList);
                    }
                };
                db.close();

            };

        };


        self.findById = function(id, cb){

            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("projects", "readwrite");
                var store = tx.objectStore("projects");
                store.get(id).onsuccess = function(event) {
                    if(event.target.result && event.target.result.status == dbEnums.status.active){
                        cb(null, event.target.result);
                    }
                    else  cb(null, null);

                };
                db.close();

            };

        };

        self.delete = function(id, cb){
            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("projects", "readwrite");
                var store = tx.objectStore("projects");

                store.delete(id).onsuccess = function(event) {
                    cb(null,true);
                    //$rootScope.$emit('projectList-update');
                    projectListUpdateEvent();
                };
                db.close();

            };
        };

        var projectListUpdateEvent=ionic.debounce(function(){
            $rootScope.$emit('projectList-update');
        },200);

    }]);
}).call(this);
