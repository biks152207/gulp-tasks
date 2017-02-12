(function(){
    app.service('notificationModel', ["$rootScope", "TodoZuDB", function($rootScope, TodoZuDB){
        var self  = this;
        var MAX_LIMIT = 50;
        function removeOverFlowItems(){
            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("notifications", "readwrite");
                var store = tx.objectStore("notifications");
                var countStore = store.count();
                countStore.onsuccess = function() {
                    var count = countStore.result- MAX_LIMIT;
                    var i =0;
                    store.openCursor().onsuccess = function(event) {
                        var cursor = event.target.result;
                        if (cursor) {
                            if(i<count){
                                cursor.delete();
                            }
                            i++;
                            cursor.continue();
                        }

                    };
                };
                db.close();
            };
        }

        self.addOrUpdate = function(notification, cb){

            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("notifications", "readwrite");
                var store = tx.objectStore("notifications");
                notification.id = notification._id;
                store.put(notification);
                db.close();
                removeOverFlowItems();
                cb(null, notification);
                //console.log("here");
                self.getNoOfUnseen(function(err,n){
                    console.log(n);
                    $rootScope.$emit('NoNN-update', n);
                });
                $rootScope.$emit('notificationList-update', notification);
            };

        };

        self.bulkUpdate = function(notificationList, cb){

            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("notifications", "readwrite");
                var store = tx.objectStore("notifications");
                for(var i = 0;i< notificationList.length; i++){
                    notificationList[i].id = notificationList[i]._id;
                    store.put(notificationList[i]);
                }
                cb();
                db.close();
                self.getNoOfUnseen(function(err,n){
                    $rootScope.$emit('NoNN-update', n);
                });
                $rootScope.$emit('notificationList-update');
            }
        };

        self.bulkSeen = function(cb){

            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("notifications", "readwrite");
                var store = tx.objectStore("notifications");
                store.openCursor().onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        cursor.value.seen = true;
                        store.put(cursor.value);
                        cursor.continue();
                    }
                    else {

                        cb(null);
                        self.getNoOfUnseen(function(err,n){
                            $rootScope.$emit('NoNN-update', n);
                        });
                        $rootScope.$emit('notificationList-update');
                    }
                };
                db.close();

            }
        };

        self.delete = function(id, cb){
            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("notifications", "readwrite");
                var store = tx.objectStore("notifications");

                store.delete(id).onsuccess = function(event) {
                    cb(null,true);
                    $rootScope.$emit('notificationList-update');
                };
                db.close();

            };
        };

        self.getAll = function(cb){

            var notificationList = [];
            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("notifications", "readwrite");
                var store = tx.objectStore("notifications");
                store.openCursor().onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        notificationList.push(cursor.value);
                        cursor.continue();
                    }
                    else {

                        cb(null, notificationList);

                    }
                };
                db.close();

            };

        };

        self.getNoOfUnseen = function(cb){
            var counter = 0;
            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("notifications", "readwrite");
                var store = tx.objectStore("notifications");
                store.openCursor().onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        if(!cursor.value.seen)  counter++;
                        cursor.continue();
                    }
                    else {
                        cb(null, counter);
                    }
                };
                db.close();

            };
        };

    }]);
}).call(this);
