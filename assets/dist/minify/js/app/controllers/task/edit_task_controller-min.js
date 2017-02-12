(function(){app.controller("editTaskController",["$q","$rootScope","$scope","$state","$ionicModal","$stateParams","$timeout","toastr","connectivity","taskService","dueService","labelService","stringService","headerService","reminderService","historyService","sharedData","project","user","date","dbEnums","message","$ionicPopup","userModel","taskListView","popupService","$ionicTabsDelegate","$ionicLoading","uiHelperService","$ionicScrollDelegate","navigationService","roleValidators","settingsService",function(e,t,a,s,r,n,c,i,o,d,u,l,m,f,k,p,b,g,h,O,j,v,T,y,M,S,D,E,w,I,R,A,$){function N(e){var t=!1;return a.taskObject.watchers&&a.taskObject.watchers.forEach(function(a){a.watcher._id===e._id&&(t=a.checked)}),t}function U(){a.taskObject.assignee=d.getAssignee(a.taskObject)||{}}function C(){var e=[];a.taskObject.users.forEach(function(t){t.role!==j.taskUserRole.assignee&&e.push({checked:t.getNotification,watcher:t})}),e=y.meTopOnList(e,"watcher"),a.taskObject.watchers=angular.copy(e)}function L(){a.taskObject.labels=[],l.getAll().then(function(e){e&&e.forEach(function(e){a.taskObject.labels.push({checked:l.isTaskExists(K,e),label:e})})})}function F(){g.getAll().then(function(e){e&&(e.splice(0,0,b.inbox),a.projects=e)})}function V(){var e;a.taskObject.reminders.forEach(function(t){t.date_created=new Date(t.date_created),e=k.getScheduledTime(t,a.taskObject.recurrence.due_date),t.invalid=O.isPast(e)||a.taskObject.recurrence.due_date&&O.isAfter(e,a.taskObject.recurrence.due_date),1==t.time.id&&(t.time.title=O.getDateTime(t.time.value))})}function x(e){void 0!==q&&!angular.equals(q,a.taskObject)&&t.rightDefaultViewVisible&&e.preventDefault()}function H(e){D.select(e)}var P,B,K,W,q,Y,G=!1,Y=a.histories=[];a.canSeeHistory=!0,a.licenseError={},P=0,B=20,a.dropdowns={watchers:!1,labels:!1,reminders:!0},a.isEmailEnabled=!1,a.defaultReminderChannels=null,a.taskComplete=function(){var e={name:s.current.name,params:{id:K}};d.bulkCompleteRequest([a.taskObject],!1,e),W&&M.setDefaultView(),b.home()},a.setFavourites=function(){var e={isFavourite:!a.isFavourite,taskIds:[a.taskObject.id]};d.bulkFavourites(e).then(function(e){e?t.$emit("toast-message",v.successMessages.TASK_ADD_TO_FAVOURITE):t.$emit("toast-message",v.successMessages.TASK_REMOVE_FROM_FAVOURITE),a.isFavourite=e})},a.toggleMenu=function(e){a.dropdowns[e]=!a.dropdowns[e]},a.setAssignees=function(){var t=e.defer();return a.assignees=[],a.taskObject.project.id?g.findById(a.taskObject.project.id).then(function(e){e.users.forEach(function(e){e.status===j.status.active&&a.assignees.push(e)}),a.assignees=y.meTopOnList(a.assignees),a.assignees.unshift({_id:0,displayName:"Unassigned"}),t.resolve(a.assignees)}):(a.assignees.push({_id:0,displayName:"Unassigned"}),t.resolve(a.assignees)),t.promise},a.setReminders=function(e,t){var s=[],r=angular.copy(a.taskObject.reminders);if(r.length){if(e){a.prevReminders.forEach(function(e){_.some(a.taskObject.reminders,e)||r.push(e)});var n=angular.copy(a.assignees);n.splice(0,1),r.forEach(function(e){if(n.length){for(var t=0;t<n.length;t++)if(e.assignee._id==n[t]._id){s.push(e);break}}else e.assignee._id==y.getLoggedInId()&&s.push(e)})}else t&&r.forEach(function(e){(e.time.id||!e.time.id&&a.taskObject.recurrence.due_date)&&s.push(e)});a.taskObject.reminders=angular.copy(s),V()}},a.setWatchers=function(e,t){var s=[];a.taskObject.watchers.length&&!e||(a.taskObject.project.id?g.findById(a.taskObject.project.id).then(function(e){e.users.forEach(function(e){a.taskObject.assignee._id!==e._id&&e.status===j.status.active&&s.push({checked:N(e),watcher:e})}),s=y.meTopOnList(s,"watcher"),a.taskObject.watchers=angular.copy(s),t&&t()}):(a.taskObject.watchers=angular.copy(s),t&&t()))},a.setDueDate=function(){a.taskObject.recurrence={},a.taskObject.hasDueDate=!0,a.dueDateSummary=m.EMPTY,a.setReminders(!1,!0)},a.createModals=function(){r.fromTemplateUrl("html/views/modals/tasks/projects.html",function(e){a.projectModal=e},{scope:a,animation:"scale-in"}),r.fromTemplateUrl("html/views/modals/tasks/assignees.html",function(e){a.userModal=e},{scope:a,animation:"scale-in"}),r.fromTemplateUrl("html/views/modals/tasks/priorities.html",function(e){a.priorityModal=e},{scope:a,animation:"scale-in"}),r.fromTemplateUrl("html/views/modals/tasks/due_date.html",function(e){a.dueDateModal=e},{scope:a,animation:"scale-in"})},a.updateProject=function(e,s){var r=a.taskObject.project.id!=e.id,n=!1;void 0!==q&&!angular.equals(q,a.taskObject)&&t.rightDefaultViewVisible&&(n=!0),a.taskObject.project={id:e.id,name:e.name,color:e.color},(r||s)&&(a.taskObject.assignee={},a.setAssignees().then(function(){a.setReminders(!0,!1),a.setWatchers(!0,function(){s&&!n&&(q=a.taskObject)})}))},a.updateAssignee=function(e){a.taskObject.assignee={_id:e._id,displayName:e.displayName,displayShortName:e.displayShortName,email:e.email,avatar:e.avatar},a.setWatchers(!0)},a.updatePriority=function(e){a.taskObject.priority=e},a.updateDueDate=function(e){var t=a.taskObject.recurrence.due_date?new Date(a.taskObject.recurrence.due_date):null;switch(e){case"TODAY":a.taskObject.recurrence={due_date:O.getDateOnly(O.today())};break;case"TOMORROW":a.taskObject.recurrence={due_date:O.getDateOnly(O.tomorrow())};break;case"WEEK":a.taskObject.recurrence={due_date:O.getDateOnly(O.nextWeek())};break;case"MONTH":a.taskObject.recurrence={due_date:O.getDateOnly(O.nextMonth())};break;case"NO_DATE":a.dueDateModal.show();break;case"CUSTOM_DATE":a.taskObject.recurrence={due_date:a.taskObject.recurrence.due_date}}"NO_DATE"!=e&&(a.taskObject.hasDueDate=!0,a.taskObject.recurrence&&a.taskObject.recurrence.due_date&&(a.taskObject.recurrence.due_date=new Date(a.taskObject.recurrence.due_date),t&&"CUSTOM_DATE"!==e&&(a.taskObject.recurrence.due_date.setHours(t.getHours()),a.taskObject.recurrence.due_date.setMinutes(t.getMinutes()),a.taskObject.recurrence.due_date.setSeconds(t.getSeconds()),a.taskObject.recurrence.due_date.setMilliseconds(t.getMilliseconds()))),a.dueDateSummary=u.getSummary(a.taskObject.recurrence),a.setReminders(!1,!0))},a.addReminder=function(e){e&&(a.taskObject.reminders.push(a.reminderObject),a.dropdowns.reminders=!0,V()),a.reminderObject={}},a.removeReminder=function(e){var t=v.infoMessages.REMINDER_DELETE_CONFIRMATION;T.show({title:t.title,template:t.message,scope:a,buttons:[{text:m.NO,onTap:function(){return!0}},{text:m.YES,onTap:function(){for(var t=0;t<a.taskObject.reminders.length;t++)if(a.taskObject.reminders[t].id==e){a.taskObject.removeReminders.push(e),a.taskObject.reminders.splice(t,1),V();break}}}]})},a.getRecurrenceModel=function(e){e?(a.recurrence=e,a.taskObject.hasDueDate=!0,a.taskObject.recurrence=u.setDueDate(a.taskObject.recurrence),a.dueDateSummary=u.getSummary(a.taskObject.recurrence),a.setReminders(!1,!0)):a.dueDateModal.show()},a.saveKeyEnter=function(e){13==e.keyCode&&a.save()},a.tabFocus=function(e){13==e.keyCode&&(2==e.target.tabIndex?a.projectModal.show():3==e.target.tabIndex?a.userModal.show():4==e.target.tabIndex?a.toggleMenu("watchers"):5==e.target.tabIndex?a.priorityModal.show():6==e.target.tabIndex?a.toggleMenu("labels"):7==e.target.tabIndex?a.dueDateModal.show():8==e.target.tabIndex&&a.toggleMenu("reminders"))},a.save=function(){a.form.$submitted=!0,a.form.$valid&&d.update(a.taskObject,q).then(function(e){return e&&t.$emit("toast-message",v.successMessages.TASK_EDITED),Y=!0,W?(M.clearAllSelected(),void c(function(){w.focusTo(a.taskObject.id,I.$getByHandle("tasksScrollHandle"),{offsetTop:20})})):void R.goBack({focusedTaskId:a.taskObject.id})})},a.discardPopup=function(e,r){S.discard(t).then(function(t){return!t||(G=!0,d.clearTaskObject(),a.projectModal&&a.projectModal.remove(),a.userModal&&a.userModal.remove(),a.priorityModal&&a.priorityModal.remove(),a.dueDateModal&&a.dueDateModal.remove(),M.setDefaultView(),s.go(e.name,r),void 0)})},a.start=function(){function e(e){e?(a.createModals(),a.taskObject=e,a.disableModification=e.status==j.status.complete,a.taskObject.removeReminders=[],a.reminderObject={},F(),U(),a.setAssignees(),C(),L(),V(),a.taskObject.prevRecurrence=angular.copy(e.recurrence),a.prevReminders=angular.copy(e.reminders),a.dueDateSummary=u.getSummary(a.taskObject.recurrence),a.priorities=d.priorities,a.loginId=y.getLoggedInId(),W?t.$emit("list:header-scope",a):(f.setEditTaskHeader(a,K),t.$emit("task:header",s.current.state,e),a.date_created=O.getDateTime(a.taskObject.date_created)),a.isFavourite=d.isFavourite(a.taskObject,a.loginId),c(function(){a.taskObject.prevRecurrence=angular.copy(e.recurrence),q=angular.copy(a.taskObject),n.showType&&"reopen"==n.showType&&E.hide()},800)):b.home()}Y=!1,W=!!n.type,K=n.id,W||(a.title="Edit Task",a.addUrl="#/task/edit/"+K,a.noteUrl="#/task/note/"+K);var r=$.getSettings();a.defaultReminderChannels=r.reminder.taskCreateReminderNotificationChannels;var i=y.getLoggedInUser();A.checkUserRole(i,j.USER_ROLES.EMAIL_NOTIFICATIONS,{},!1).then(function(){a.isEmailEnabled=!0}),A.checkUserRole(i,j.USER_ROLES.TASK_HISTORY,{},!1).then(function(){},function(e){a.canSeeHistory=!1,a.licenseError=v.infoMessages.TASK_HISTORY}),n.showType&&"reopen"==n.showType&&E.show(),d.findActiveTaskById(K).then(function(a){a?e(a):t.closedTask?e(t.closedTask):d.getTaskFromServer(K).then(function(a){a?e(a):t.$emit("toast-message",v.errorMessages.TASK_NOT_FOUND)},function(e){t.$emit("toast-message",e.msg)})})},a.start(),a.$on("$stateChangeStart",function(e,t,s){G||Y||!q||angular.equals(q,a.taskObject)?(a.projectModal&&a.projectModal.remove(),a.userModal&&a.userModal.remove(),a.priorityModal&&a.priorityModal.remove(),a.dueDateModal&&a.dueDateModal.remove(),M.setDefaultView()):(e.preventDefault(),a.discardPopup(t,s))}),a.$on("beforeTaskListSelectionChange",function(e,t,a,s){x(e)}),a.loadMore=function(){o.isConnected()?p.getHistoriesByTaskId(K,P,B).then(function(e){e.length?(e.forEach(function(e){e.icon=b.EVENT_ICONS[e.key],e.type==j.status.reopened&&(e.icon=b.EVENT_ICONS[e.type.toUpperCase()]),e.date_modified=O.getDateTime(e.date_modified),a.histories.push(e)}),P+=B):a.noMoreItemsAvailable=!0,a.$broadcast("scroll.infiniteScrollComplete")}):a.noMoreItemsAvailable=!0};var z=t.$on("task:update-favourite",function(e,t){a.isFavourite=t});a.$on("default:tabswitch",function(e){x(e),e.defaultPrevented&&(e.promise=S.discard(t),e.promise.then(function(e){G=e}))}),a.$on("$destroy",function(){z(),J()}),a.toggleTab=function(e){var a=t.$broadcast("default:tabswitch");a.defaultPrevented?a.promise&&a.promise.then(function(t){t&&H(e)}):H(e)};var J=t.$on("projectList-update",function(){a.taskObject.project.id&&g.findById(a.taskObject.project.id).then(function(e){e&&a.updateProject(e,!0)})});a.selectLabel=function(e,t){var s=y.getLoggedInUser();console.log("label "+t.label.name+" : "+t.checked),t.checked&&A.checkUserRole(s,j.USER_ROLES.LABELS_ASSIGN,{labels:[t],task:a.taskObject},!0).then(function(){},function(e){c(function(){t.checked=!t.checked})})},a.copyTask=function(e){d.copyTask(e).then(function(e){d.setTaskObject(e),s.go("/task/add")})}}])}).call(this);