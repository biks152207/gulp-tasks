(function() {
    app.service('noteService', ["$http", "$q", "$rootScope", "taskModel", "Upload", "sync", "dbEnums", "connectivity", "RESPONSE_CODE", "message", "API", "userModel", function($http, $q, $rootScope, taskModel, Upload, sync, dbEnums, connectivity,
                                        RESPONSE_CODE, message, API, userModel) {

        var self = this;


        function deleteNoteById(noteList, id){
            for(var i=0; i< noteList.length; i++){

                if(noteList[i].id == id){
                    noteList.splice(i, 1);
                    break;
                }
            }
            return noteList;
        }

        self.add = function(data){

            var defer = $q.defer();

            taskModel.findById(data.taskId, function(err, task){
                data.note.date_modified = new Date();
                task.notes.push(data.note);
                sync.add(dbEnums.collections.Task,{
                    task: task,
                    note: data.note
                } , dbEnums.events.Task.addNote);
                taskModel.addOrUpdate(task, function(err, results){
                    defer.resolve(results);
                });
            });
            return defer.promise;
        };

        self.edit = function(data){

            var defer = $q.defer();

            taskModel.findById(data.taskId, function(err, task){

                for(var i=0;i< task.notes.length; i++){
                    if(task.notes[i].id === data.note.id){
                        task.notes[i].description = data.note.description;
                        task.notes[i].date_modified = new Date();
                        break;
                    }
                }
                sync.add(dbEnums.collections.Task,{
                    task: task,
                    note: data.note
                } , dbEnums.events.Task.updateNote);
                taskModel.addOrUpdate(task, function(err, results){
                    defer.resolve(results);
                });
            });
            return defer.promise;

        };

        self.delete = function (data){

            var defer = $q.defer();
            taskModel.findById(data.taskId, function(err, task){

                data.noteIds.forEach(function(noteId){
                    task.notes = angular.copy(deleteNoteById(task.notes, noteId));
                });
                task.date_modified = Date.now();
                sync.add(dbEnums.collections.Task,{
                    task: task,
                    noteIds: data.noteIds,
                    updatedBy: userModel.getLoggedInUser()
                } , dbEnums.events.Task.deleteNote);
                taskModel.addOrUpdate(task, function(err, results){
                    defer.resolve(results);
                });

            });
            return defer.promise;

        };

        self.uploadNote = function (data) {

            var defer = $q.defer();

            if(connectivity.isConnected()){
                Upload.upload({
                    url: API.task.uploadNote,
                    fields: data,
                    file: data.file
                }).progress(function (evt) {

                    var loaded = parseFloat(evt.loaded);
                    var total = parseFloat(evt.total);
                    $rootScope.progressPercentage = 100.0*(loaded/(2*total));
                    console.log($rootScope.progressPercentage);

                }).success(function (results) {
                    console.log(results);
                    if (results.response_code == RESPONSE_CODE.SUCCESS) {
                         $rootScope.progressPercentage = 100;
                        defer.resolve({
                            error:false,
                            msg: message.successMessages.ATTACHMENT_ADDED
                        });
                    }
                    else if (results.response_code === RESPONSE_CODE.ERROR) {
                        defer.resolve({
                            error:true,
                            msg: message.errorMessages[results.errors.value],
                            results: results
                        });
                    }
                }).error(function (err) {
                    defer.resolve({
                        error:true,
                        msg: message.errorMessages.GENERAL,
                        results: err
                    });
                });
            }
            else {
                defer.resolve({
                    error:true,
                    msg: message.errorMessages.CONNECTION_REQUIRED
                });
            }
            return defer.promise;
       };

    }]);


}).call(this);
