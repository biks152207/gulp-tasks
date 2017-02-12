(function(){app.service("TodoZuDB",["$q","$window",function(e,t){var n,o=this;o.version=1,o.name="todozu-db",o.createDatabase=function(){n=t.indexedDB||t.mozIndexedDB||t.webkitIndexedDB||t.msIndexedDB||t.shimIndexedDB},o.createInstances=function(){var t=e.defer(),r=n.open(o.name,o.version);return r.onupgradeneeded=function(){var e=r.result,n=e.createObjectStore("changes",{keyPath:"id",autoIncrement:!0});n=e.createObjectStore("filters",{keyPath:"id"}),n=e.createObjectStore("labels",{keyPath:"id"}),n=e.createObjectStore("projects",{keyPath:"id"}),n=e.createObjectStore("tasks",{keyPath:"id"}),n=e.createObjectStore("reminders",{keyPath:"id"}),n=e.createObjectStore("notifications",{keyPath:"id"}),t.resolve(),e.close()},t.promise},o.getDb=function(){return console.log("getting db instance..."),console.log(n),n},o.dropDatabase=function(){return new Promise(function(e,t){var r=n.deleteDatabase(o.name);r.onsuccess=function(t){e(t)},r.onerror=function(e){console.log("error while deleting"),t(e)},r.onblocked=function(e){console.log("blocked, unable to delete"),t(e)}})}}])}).call(this);