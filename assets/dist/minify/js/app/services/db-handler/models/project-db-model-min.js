(function(){app.service("projectModel",["$rootScope","userModel","dbEnums","TodoZuDB","taskModel",function(t,e,o,r,s){var n=this;n.addOrUpdate=function(t,e){var o=r.getDb().open("todozu-db",r.version);o.onsuccess=function(){var r=o.result,n=r.transaction("projects","readwrite"),c=n.objectStore("projects");c.put(t),s.updateProjectInfo(t,function(){}),e(null,t),r.close(),u()}},n.bulkUpdate=function(t,e,o){"function"==typeof e&&(o=e,e=!1);var s=r.getDb().open("todozu-db",r.version);s.onsuccess=function(){for(var r=s.result,n=r.transaction("projects","readwrite"),c=n.objectStore("projects"),a=0;a<t.length;a++)c.put(t[a]);e||u(),o(),r.close()}},n.getAll=function(t){s.getAll(function(s,n){n=n||[];var u=[],c=r.getDb().open("todozu-db",r.version);c.onsuccess=function(){var r=c.result,s=r.transaction("projects","readwrite"),a=s.objectStore("projects");a.openCursor().onsuccess=function(r){var s=r.target.result;s?(s.value.users.forEach(function(t){t._id==e.getLoggedInId()&&t.status===o.status.active&&s.value.status==o.status.active&&(s.value.order=t.order,s.value.tasksCount=0,n.forEach(function(t){t.project&&t.project.id===s.value.id&&(s.value.tasksCount+=1)}),u.push(s.value))}),s.continue()):t(null,_.sortBy(u,"order"))},r.close()}})},n.getUserCreatedActiveProjects=function(t,e){n.getUserCreatedProjects(t,function(t,r){if(t)e(t);else{var s=_.filter(r,function(t){var e=!1;return t.status==o.status.active&&(e=!0),e});e(null,s)}})},n.getUserCreatedProjects=function(t,e){var o=[],s=r.getDb().open("todozu-db",r.version);s.onsuccess=function(){var r=s.result,n=r.transaction("projects","readwrite"),u=n.objectStore("projects");u.openCursor().onsuccess=function(r){var s=r.target.result;s?(s.value.users.forEach(function(e){e._id==t&&1==e.isAdmin&&(s.value.order=e.order,o.push(s.value))}),s.continue()):e(null,_.sortBy(o,"order"))},r.close()}},n.getAllArchived=function(t){var s=[],n=r.getDb().open("todozu-db",r.version);n.onsuccess=function(){var r=n.result,u=r.transaction("projects","readwrite"),c=u.objectStore("projects");c.openCursor().onsuccess=function(r){var n=r.target.result;n?(n.value.users.forEach(function(t){t._id==e.getLoggedInId()&&t.status===o.status.archived&&s.push(n.value)}),n.continue()):t(null,s)},r.close()}},n.findById=function(t,e){var s=r.getDb().open("todozu-db",r.version);s.onsuccess=function(){var r=s.result,n=r.transaction("projects","readwrite"),u=n.objectStore("projects");u.get(t).onsuccess=function(t){t.target.result&&t.target.result.status==o.status.active?e(null,t.target.result):e(null,null)},r.close()}},n.delete=function(t,e){var o=r.getDb().open("todozu-db",r.version);o.onsuccess=function(){var r=o.result,s=r.transaction("projects","readwrite"),n=s.objectStore("projects");n.delete(t).onsuccess=function(t){e(null,!0),u()},r.close()}};var u=ionic.debounce(function(){t.$emit("projectList-update")},200)}])}).call(this);