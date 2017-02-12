(function(){app.service("filterModel",["$rootScope","TodoZuDB","dbEnums",function(t,e,o){var s=this;s.addOrUpdate=function(o,s){var n=e.getDb().open("todozu-db",e.version);n.onsuccess=function(){var e=n.result,r=e.transaction("filters","readwrite"),i=r.objectStore("filters");i.put(o),s(null,o),e.close(),t.$emit("filterList-update",o)}},s.bulkUpdate=function(o,s){var n=e.getDb().open("todozu-db",e.version);n.onsuccess=function(){for(var e=n.result,r=e.transaction("filters","readwrite"),i=r.objectStore("filters"),u=0;u<o.length;u++)i.put(o[u]);s(),e.close(),t.$emit("filterList-update")}},s.getAll=function(t){var s=[],n=e.getDb().open("todozu-db",e.version);n.onsuccess=function(){var e=n.result,r=e.transaction("filters","readwrite"),i=r.objectStore("filters");i.openCursor().onsuccess=function(e){var n=e.target.result;n?(n.value.status===o.status.active&&s.push(n.value),n.continue()):t(null,s)},e.close()}},s.findById=function(t,o){var s=e.getDb().open("todozu-db",e.version);s.onsuccess=function(){var e=s.result,n=e.transaction("filters","readwrite"),r=n.objectStore("filters");r.get(t).onsuccess=function(t){o(null,t.target.result)},e.close()}},s.delete=function(o,s){var n=e.getDb().open("todozu-db",e.version);n.onsuccess=function(){var e=n.result,r=e.transaction("filters","readwrite"),i=r.objectStore("filters");i.delete(o).onsuccess=function(e){s(null,!0),t.$emit("filterList-update")},e.close()}}}])}).call(this);