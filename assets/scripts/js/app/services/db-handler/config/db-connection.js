(function(){
    app.service('TodoZuDB', function($q, $window){
        var self  = this;
        var indexedDB;
        self.version = 1;
        self.name = "todozu-db";

        self.createDatabase = function(){
            indexedDB = $window.indexedDB || $window.mozIndexedDB || $window.webkitIndexedDB || $window.msIndexedDB || $window.shimIndexedDB;
        };

        self.createInstances = function(){

            var defer = $q.defer();
            var open = indexedDB.open(self.name, self.version);
            open.onupgradeneeded = function() {
                var db = open.result;

                //Changes
                var store = db.createObjectStore("changes", {keyPath: "id", autoIncrement:true });
                //Filters
                store = db.createObjectStore("filters", {keyPath: "id"});
                //Labels
                store = db.createObjectStore("labels", {keyPath: "id"});
                //Projects
                store = db.createObjectStore("projects", {keyPath: "id"});
                //Tasks
                store = db.createObjectStore("tasks", {keyPath: "id"});
                //web_reminder
                store = db.createObjectStore("reminders", {keyPath: "id"});
                //Notifications
                store = db.createObjectStore("notifications", {keyPath: "id"});
                defer.resolve();
                db.close();

            };

            return defer.promise;
        };

        self.getDb = function(){
          console.log('getting db instance...')
          console.log(indexedDB);
          return indexedDB;
        };

        self.dropDatabase = function(){
            return new Promise(function(resolve, reject){
                var deleteDbRequest= indexedDB.deleteDatabase(self.name);
                deleteDbRequest.onsuccess= function(e){
                    resolve(e);
                };
                deleteDbRequest.onerror= function(e){
                    console.log('error while deleting');
                    reject(e);
                };
                deleteDbRequest.onblocked= function(e){
                    console.log('blocked, unable to delete');
                    reject(e);
                };
            });
        };

    });
}).call(this);
