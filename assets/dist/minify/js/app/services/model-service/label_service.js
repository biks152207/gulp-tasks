(function () {
    app.service('labelService', ["$rootScope", "$q", "sharedData", "sync", "dbEnums", "roleValidators", "labelModel", "userModel", function ( $rootScope, $q, sharedData,
                                             sync, dbEnums,roleValidators, labelModel,userModel) {

        var self = this;

        self.addOrUpdate = function(label){
            var defer = $q.defer();
            var user=userModel.getLoggedInUser();
            roleValidators.checkUserRole(user,[dbEnums.USER_ROLES.LABELS],{label:label,user:user},true)
                .then(function(){
                    console.log('lbl added '+label.name);
                    //defer.resolve();
                    //return;

                    sync.add(dbEnums.collections.Label, label, dbEnums.events.Label.addOrUpdate);
                    labelModel.addOrUpdate(label, function(err, results){
                        defer.resolve(results);
                    });
                },defer.reject);


            return defer.promise;
        };

        self.addTaskToLabels = function(labelList, taskId){

            labelList.forEach(function(object){
                if(object.checked && !self.isTaskExists(taskId, object.label)){
                    object.label.tasks.push(taskId);
                    labelModel.addOrUpdate(object.label, function(err, label){});
                }
                else if(!object.checked && self.isTaskExists(taskId, object.label)){
                    var index = object.label.tasks.indexOf(taskId);
                    object.label.tasks.splice(index, 1);
                    labelModel.addOrUpdate(object.label, function(err, label){});
                }
            });
        };

        self.addLabelsOnTask=function(labelsList,task){
            return $q(function(resolve,reject){
                var asyncTask=$q(function(resolve,reject){
                    resolve();
                });
                _.each(labelsList,function(lbl){
                    if(!self.isTaskExists(task.id, lbl)){
                        asyncTask=asyncTask.then(function(){
                            return $q(function(resolve,reject){

                                lbl.tasks.push(task.id);
                                labelModel.addOrUpdate(lbl, function(err, label){
                                    resolve();
                                });
                            }) ;
                        });
                    }


                });

                asyncTask.then(resolve,reject);
            });
        }

        self.delete = function(label){
            var defer = $q.defer();
            sync.add(dbEnums.collections.Label, label, dbEnums.events.Label.delete);
            labelModel.delete(label.id, function(err, isDeleted){
                if(isDeleted){
                    //code for deleted from corresponding tasks

                }
                defer.resolve(isDeleted);
            });

            return defer.promise;
        };

        self.findById = function (id) {
            var defer = $q.defer();
            labelModel.findById(id, function(err, label){
                defer.resolve(label);
            });
            return defer.promise;
        };

        self.getAll = function () {
            var defer = $q.defer();

            labelModel.getAll(function(err, list){
                 defer.resolve(list)

            });
            return defer.promise;
        };

        self.isTaskExists = function (taskId, label) {

            for(var i=0;  i < label.tasks.length; i++){
                if(label.tasks[i] == taskId) {
                    return true;
                }
            }
            return false;
        };

        self.removeTaskFromAllLabels = function(task){

            labelModel.getAll(function(err, list){
                list.forEach(function(label){
                    label.tasks.forEach(function(id, index){
                        if(id == task.id){
                            label.tasks.splice(index, 1);
                        }
                    })
                });

                labelModel.bulkUpdate(list, function(){});
            });

        };

        self.updateItem = function(item) {
            if(item.status === dbEnums.status.active){
                labelModel.addOrUpdate(item, function(err, label){

                });
            }
            else if(item.status === dbEnums.status.deleted){
                labelModel.delete(item.id, function(err, isDeleted){});
            }

        };


        //Not implemented yet
        self.reOrderLabelList = function (fromIndex, toIndex) {

           /* var labelList = self.getLabelList();

            var moved = labelList.splice(fromIndex, 1);
            labelList.splice(toIndex, 0, moved[0]);

            for (var i = 0, len = labelList.length; i < len; i++)  labelList[i].index = i;

            $window.localStorage.setItem('labels', JSON.stringify(labelList));*/

        };


    }]);
}).call(this);