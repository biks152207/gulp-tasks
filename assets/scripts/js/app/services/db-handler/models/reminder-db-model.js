(function(){
    app.service('reminderModel', function(TodoZuDB){
        var self  = this;

        self.addOrUpdate = function(reminder, cb){

            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("reminders", "readwrite");
                var store = tx.objectStore("reminders");
                store.put(reminder);
                cb(null, reminder);
                db.close();
            };

        };

        self.getAll = function(cb){

            var reminderList = [];
            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("reminders", "readwrite");
                var store = tx.objectStore("reminders");
                store.openCursor().onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        reminderList.push(cursor.value);
                        cursor.continue();
                    }
                    else {

                        cb(null, reminderList);
                    }
                };
                db.close();

            };

        };

        self.findById = function(id, cb){

            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("reminders", "readwrite");
                var store = tx.objectStore("reminders");

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
                var tx = db.transaction("reminders", "readwrite");
                var store = tx.objectStore("reminders");

                store.delete(id).onsuccess = function(event) {
                    cb(null,true);
                };
                db.close();

            };
        };

        self.deleteRemindersByTaskId = function(taskId, cb){

            var open = TodoZuDB.getDb().open("todozu-db", TodoZuDB.version);
            open.onsuccess = function() {
                var db = open.result;
                var tx = db.transaction("reminders", "readwrite");
                var store = tx.objectStore("reminders");
                store.openCursor().onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        if( cursor.value.taskId == taskId) cursor.delete();
                        cursor.continue();
                    }
                    else {
                        cb();
                    }
                };
                db.close();
            };

        };
    });
}).call(this);
