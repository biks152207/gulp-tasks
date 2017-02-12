(function(){
    app.service('sync', function( $q, $window, $http, $rootScope,
                                 API, connectivity, TodoZuDB,  $timeout,
                                   projectModel, filterModel, labelModel, settingsModel, taskModel, userModel,notificationModel){
        var self  = this;
        var hasChanges = false;
        var pushInProgress = false;
        var pullInProgress = false;

        self.clearInstance = function(){

            var open = TodoZuDB.getDb().open(TodoZuDB.name, TodoZuDB.version);

            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("changes", "readwrite");
                tx.objectStore("changes").clear();
                db.close();
            };


        };

        self.add = function(collectionName, object, type){

            var change = {
                collectionName: collectionName,
                object: object,
                type: type,
                timestamp: Date()
            };
            var open = TodoZuDB.getDb().open(TodoZuDB.name, TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("changes", "readwrite");
                var store = tx.objectStore("changes");
                store.put(change);
                hasChanges = true;
                $rootScope.$emit('push-to-server');
                db.close();
            };

        };

        function send(data){
            var defer = $q.defer();
            if(connectivity.isConnected()){
                $http.post(API.sync.push, data)
                    .success(function (results) {
                       defer.resolve(true);
                    }).error(function (results) {
                        //send while successfully pushed
                        console.log('pushing error', results);
                        defer.resolve(false);

                    });
            }
            else defer.resolve(false);
            return defer.promise;
        }

        $rootScope.$on('push-to-server', function(event, pullAfterPush,isStartup){

             $timeout(function(){
                 if(hasChanges && !pushInProgress){
                     pushInProgress = true;
                     var changeList = [];
                     var open = TodoZuDB.getDb().open(TodoZuDB.name, TodoZuDB.version);

                     open.onsuccess = function() {
                         var db = open.result;
                         var tx = db.transaction("changes", "readwrite");
                         var store = tx.objectStore("changes");
                         store.openCursor().onsuccess = function(event) {

                             var cursor = event.target.result;
                             if (cursor) {
                                 changeList.push(cursor.value);
                                 cursor.continue();
                             }
                             else {
                                 send(changeList).then(function(success){
                                     if(success){
                                         hasChanges = false;
                                         if(pullAfterPush) $rootScope.$emit('pull-from-server',isStartup);
                                         self.clearInstance();
                                     }
                                     pushInProgress = false;
                                 });
                             }
                         };
                         db.close();

                     };
                 }
                 else if (pullAfterPush){
                     $rootScope.$emit('pull-from-server');
                 }
             }, 500);


        });

        $rootScope.$on('pull-from-server', function(isStartup){
            if(connectivity.isConnected() && !hasChanges && !pullInProgress && userModel.isAuthenticated()){
                pullInProgress = true;
                var data = {
                    id: userModel.getLoggedInId(),
                    timestamp: userModel.getLastPullTimestamp()
                };
                $http.post(API.sync.pull, data)
                    .success(function (results) {
                        console.log('pull success');
                       // console.log('pull success', results.data);
                        var data = results.data;

                        userModel.setLastPullTimestamp(new Date());
                        if(data.features) userModel.saveUserFeatures(data.features);

                        if(data.licenseFeatures) userModel.saveAllFeatures(data.licenseFeatures);

                        if(data.settings){
                            settingsModel.addOrUpdate(data.settings, function(){});
                            if(data.settings.filterView){
                                settingsModel.setAllFilterViews(data.settings.filterView);
                            }
                            if(data.settings.sortOption){
                                settingsModel.setAllSortOptions(data.settings.sortOption);
                            }
                        }

                        if(data.projects.length)projectModel.bulkUpdate(data.projects, function(){});
                        if(data.labels.length)labelModel.bulkUpdate(data.labels, function(){});
                        if(data.filters.length)filterModel.bulkUpdate(data.filters, function(){});
                        if(data.tasks.length)taskModel.bulkUpdate(data.tasks, function(){});
                        if(data.taskCustomOrders && data.taskCustomOrders.length){
                            userModel.changeTaskSortOrder(data.taskCustomOrders,function(){

                            });
                        }

                        if(data.notifications && data.notifications.length>0){
                            notificationModel.bulkUpdate(data.notifications, function(){});
                        }
                        pullInProgress = false;

                    }).error(function (results) {
                        console.log('pull error',results);
                        pullInProgress = false;
                    })
                    .finally(function(){
                        $rootScope.$emit('pull-from-server-complete');
                    });
            }
            else{
                $rootScope.$emit('pull-from-server-complete');
            }
        });

    });
}).call(this);
