(function(){app.controller("listHeaderController",["$rootScope","$scope","$state","$ionicSideMenuDelegate","date","sortService","platformService","$ionicPopover","rightMenuService","sharedData","notificationService","taskService","dbEnums","userModel","taskListView",function(e,t,s,i,o,a,c,n,r,u,l,f,h,d,p){function m(){n.fromTemplateUrl("html/views/popovers/top_right_popover.html",{scope:$}).then(function(e){$.popover=e}),n.fromTemplateUrl("html/views/popovers/notification_popover.html",{scope:$}).then(function(e){$.notificationBar=e})}function v(t){t?1==t?e.numberOfTasks="1 task":e.numberOfTasks=t+" tasks":e.numberOfTasks="No tasks"}var $=t,k={},b={};$.sortService=a,t.searchBar={searchText:"",isVisible:!1},d.isAuthenticated()&&l.getNoOfUnseen().then(function(e){t.NoNN=e}),t.items=[],$.home=function(){u.home()},$.menuItemClicked=function(e,t){$.popover.hide(),r.itemClicked(e,k,$,t)},$.openNotificationBar=function(e){r.openNotificationBar(e,$)},$.save=function(){b&&b.save()},$.searchStart=function(){t.focused=!0,e.$emit("search:start",t.focused),e.$emit("search:tasks",t.searchBar.searchText),""==t.searchBar.searchText&&p.clearAllSelected()},$.sendSearchText=function(s){t.focused||(t.focused=!0,e.$emit("search:start",t.focused)),e.$emit("search:tasks",s)},$.searchOutOfFocus=function(s){t.focused=!1,e.$emit("search:start",(s||"").length>0)},$.clearClicked=function(){t.searchBar.searchText="",t.focused=!1,e.$emit("search:start",!1),t.searchBar.isVisible=!1},$.taskAdd=function(){s.current.state==u.STATE.PROJECT&&f.addProjectToTaskObject(k),s.go("/task/add")},$.toggleMenu=function(){return i.toggleLeft()},$.toggleSearchBar=function(s){t.searchBar.isVisible?t.searchOutOfFocus(s):(e.$emit("search:start",!0),e.$emit("search:tasks",""),p.clearAllSelected()),t.searchBar.isVisible=!t.searchBar.isVisible};var T=e.$on("task:header-taskList",function(e,t,s,i,o){k=i,v(s),m(),r.setMenu(t,i),$.menus=r.getMenu(),$.disabledOptions=o,a.setAll(void 0,void 0,t).then(function(){}),$.disabledOptions=c.isMobileDevice()||o}),S=e.$on("list:header-scope",function(e,t){b=t,$.disableModification=t.taskObject.status==h.status.complete}),g=e.$on("NoNN-update",function(e,s){t.NoNN=s,t.$$phase||t.$apply()}),N=e.$watch("selectedFilterView",function(e,t){});$.$on("$destroy",function(){T(),S(),g(),N()})}])}).call(this);