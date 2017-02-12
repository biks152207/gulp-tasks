(function(){
    app.service('filterModel', ["$rootScope", "TodoZuDB", "dbEnums", function($rootScope, TodoZuDB, dbEnums){
        var self  = this;

        self.addOrUpdate = function(filter, cb){

            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("filters", "readwrite");
                var store = tx.objectStore("filters");
                store.put(filter);
                cb(null, filter);
                db.close();
                $rootScope.$emit('filterList-update', filter);
            };

        };

        self.bulkUpdate = function(filterList, cb){

            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("filters", "readwrite");
                var store = tx.objectStore("filters");
                for(var i = 0;i< filterList.length; i++){
                    store.put(filterList[i]);
                }
                cb();
                db.close();
                $rootScope.$emit('filterList-update');
            }
        };

        self.getAll = function(cb){

            var filterList = [];
            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("filters", "readwrite");
                var store = tx.objectStore("filters");
                store.openCursor().onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        if(cursor.value.status === dbEnums.status.active) filterList.push(cursor.value);
                        cursor.continue();
                    }
                    else {

                        cb(null, filterList);
                    }
                };
                db.close();

            };

        };

        self.findById = function(id, cb){

            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("filters", "readwrite");
                var store = tx.objectStore("filters");

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
                var tx = db.transaction("filters", "readwrite");
                var store = tx.objectStore("filters");

                store.delete(id).onsuccess = function(event) {
                    cb(null,true);
                    $rootScope.$emit('filterList-update');
                };
                db.close();

            };
        };
    }]);
}).call(this);
