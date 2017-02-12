(function(){
    app.service('labelModel', ["$rootScope", "TodoZuDB", "dbEnums", function($rootScope, TodoZuDB, dbEnums){
        var self  = this;

        self.addOrUpdate = function(label, cb){

            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("labels", "readwrite");
                var store = tx.objectStore("labels");
                store.put(label);
                cb(null, label);
                db.close();
                $rootScope.$emit('labelList-update', label);
            };

        };

        self.bulkUpdate = function(labelList, cb){

            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("labels", "readwrite");
                var store = tx.objectStore("labels");
                for(var i = 0;i< labelList.length; i++){
                    store.put(labelList[i]);
                }
                cb();
                db.close();
                $rootScope.$emit('labelList-update');
            }
        };

        self.getAll = function(cb){

            var labelList = [];
            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("labels", "readwrite");
                var store = tx.objectStore("labels");
                store.openCursor().onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        if(cursor.value.status === dbEnums.status.active) labelList.push(cursor.value);
                        cursor.continue();
                    }
                    else {

                        cb(null, labelList);
                    }
                };
                db.close();

            };

        };

        self.findById = function(id, cb){

            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("labels", "readwrite");
                var store = tx.objectStore("labels");

                store.get(id).onsuccess = function(event) {
                    cb(null, event.target.result)
                };
                db.close();

            };

        };

        self.delete = function(id, cb){
            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("labels", "readwrite");
                var store = tx.objectStore("labels");

                store.delete(id).onsuccess = function(event) {
                    cb(null,true);
                    $rootScope.$emit('labelList-update');
                };
                db.close();

            };
        };
    }]);
}).call(this);
