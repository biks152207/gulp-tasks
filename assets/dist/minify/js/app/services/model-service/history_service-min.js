(function(){app.service("historyService",["$q","$http","taskService","connectivity","API","RESPONSE_CODE","message","userModel",function(e,r,s,o,t,i,n,a){var l=this;l.getAllHistories=function(s,l){var c=e.defer();if(o.isConnected()){var u={skip:s,limit:l,userId:a.getLoggedInId()};r.post(t.history.GET.all,u).success(function(e){e.response_code===i.SUCCESS?c.resolve(e.data):e.response_code===i.ERROR&&c.resolve({error:!0,msg:n.errorMessages[e.errors.value],results:e})}).error(function(e){c.resolve({error:!0,msg:n.errorMessages.GENERAL,results:e})})}else c.resolve({error:!0,msg:n.errorMessages.CONNECTION_REQUIRED});return c.promise},l.getHistoriesByTaskId=function(s,a,l){var c=e.defer();if(o.isConnected()){var u={skip:a,limit:l,taskIds:[s]};r.post(t.history.GET.historiesByTask,u).success(function(e){e.response_code===i.SUCCESS?c.resolve(e.data):e.response_code===i.ERROR&&c.resolve({error:!0,msg:n.errorMessages[e.errors.value],results:e})}).error(function(e){c.resolve({error:!0,msg:n.errorMessages.GENERAL,results:e})})}else c.resolve({error:!0,msg:n.errorMessages.CONNECTION_REQUIRED});return c.promise}}])}).call(this);