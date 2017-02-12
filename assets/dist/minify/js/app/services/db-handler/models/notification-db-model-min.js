(function(){app.service("notificationModel",["$rootScope","TodoZuDB",function(t,o){function n(){var t=o.getDb().open("todozu-db",o.version);t.onsuccess=function(){var o=t.result,n=o.transaction("notifications","readwrite"),e=n.objectStore("notifications"),s=e.count();s.onsuccess=function(){var t=s.result-i,o=0;e.openCursor().onsuccess=function(n){var e=n.target.result;e&&(o<t&&e.delete(),o++,e.continue())}},o.close()}}var e=this,i=50;e.addOrUpdate=function(i,s){var c=o.getDb().open("todozu-db",o.version);c.onsuccess=function(){var o=c.result,u=o.transaction("notifications","readwrite"),r=u.objectStore("notifications");i.id=i._id,r.put(i),o.close(),n(),s(null,i),e.getNoOfUnseen(function(o,n){console.log(n),t.$emit("NoNN-update",n)}),t.$emit("notificationList-update",i)}},e.bulkUpdate=function(n,i){var s=o.getDb().open("todozu-db",o.version);s.onsuccess=function(){for(var o=s.result,c=o.transaction("notifications","readwrite"),u=c.objectStore("notifications"),r=0;r<n.length;r++)n[r].id=n[r]._id,u.put(n[r]);i(),o.close(),e.getNoOfUnseen(function(o,n){t.$emit("NoNN-update",n)}),t.$emit("notificationList-update")}},e.bulkSeen=function(n){var i=o.getDb().open("todozu-db",o.version);i.onsuccess=function(){var o=i.result,s=o.transaction("notifications","readwrite"),c=s.objectStore("notifications");c.openCursor().onsuccess=function(o){var i=o.target.result;i?(i.value.seen=!0,c.put(i.value),i.continue()):(n(null),e.getNoOfUnseen(function(o,n){t.$emit("NoNN-update",n)}),t.$emit("notificationList-update"))},o.close()}},e.delete=function(n,e){var i=o.getDb().open("todozu-db",o.version);i.onsuccess=function(){var o=i.result,s=o.transaction("notifications","readwrite"),c=s.objectStore("notifications");c.delete(n).onsuccess=function(o){e(null,!0),t.$emit("notificationList-update")},o.close()}},e.getAll=function(t){var n=[],e=o.getDb().open("todozu-db",o.version);e.onsuccess=function(){var o=e.result,i=o.transaction("notifications","readwrite"),s=i.objectStore("notifications");s.openCursor().onsuccess=function(o){var e=o.target.result;e?(n.push(e.value),e.continue()):t(null,n)},o.close()}},e.getNoOfUnseen=function(t){var n=0,e=o.getDb().open("todozu-db",o.version);e.onsuccess=function(){var o=e.result,i=o.transaction("notifications","readwrite"),s=i.objectStore("notifications");s.openCursor().onsuccess=function(o){var e=o.target.result;e?(e.value.seen||n++,e.continue()):t(null,n)},o.close()}}}])}).call(this);