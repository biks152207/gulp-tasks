var todoZuModules=["angucomplete-alt","angularMoment","btford.socket-io","ionic","ionMdInput","matchMedia","monospaced.elastic","ng-mfb","ngAnimate","ngCropper","ngCordova","ngFileUpload","ngSanitize","toastr","ui.bootstrap.datetimepicker","ui.router"],app=angular.module("app",todoZuModules);ionic.Platform.ready(function(){app.run(["$rootScope","$state","$templateCache","$ionicSideMenuDelegate","$ionicScrollDelegate","$cordovaStatusbar","screenSize","pushNotification","connectivity","sharedData","socket","orientation","TodoZuDB","userModel","taskService","$location","date","sortService","taskListView","platformService","user","loggingService","$ionicPopup","message","stringService","$window","gAnalytics","reminderService","popupService","$timeout",function(e,t,i,n,o,a,r,c,s,u,d,l,g,p,v,f,m,h,S,$,w,b,A,D,y,M,k,C,R,T){function F(){w.registerDeviceInfo()}if(window.StatusBar&&(StatusBar.overlaysWebView(!0),StatusBar.styleDefault()),M.cordova&&M.TestFairy&&(console.log("initializing test fairy sdk"),M.TestFairy.begin("63c43cf0d18d04c9b9673e532c6075c842d8381a")),k.init(),s.checkConnection())try{c.init().then(function(){c.getDeviceUniqueId().then(function(){if(e.isLoginProgress||!p.isAuthenticated())var t=e.$on("login-success",function(){t(),F()});else F()})})}catch(e){console.log(e)}if(b.init(),e.isMobile=$.isMobileDevice(),o.scrollTop(),g.createDatabase(),s.startMonitor(),e.desktop=r.is("md, lg"),e.mobile=r.is("xs, sm"),e.toastInstance=i.get("directives/toast/toast.html"),l.setOrientation(),window.cordova&&window.cordova.plugins.Keyboard&&cordova.plugins.Keyboard.disableScroll(!0),p.isAuthenticated()){d.connect();var I=e.$on("pull-from-server-complete",function(){I(),T(function(){C.cleanUpReminders()},1e3)});e.$emit("push-to-server",!0,!0)}e.$on("$stateChangeStart",function(i,o,a){e.loggedIn=p.isAuthenticated(),n.isOpen()&&n.toggleLeft();var r=o.requireLogin;o.name;p.isAuthenticated()&&0==r?(i.preventDefault(),u.home()):p.isAuthenticated()||1!=r||(i.preventDefault(),t.go("/login",{returnUrl:o.name,params:a.id},{reload:!0}),d.disconnect())}),e.getActiveReminders=function(e){if(void 0!==e)return v.getActiveReminders(e)},e.countActiveReminders=function(e){if(void 0!==e)return v.countActiveReminders(e)},e.isReminderActive=function(e,t){if(void 0!==t&&void 0!=e)return v.isReminderActive(e,t)},e.$on("$stateChangeSuccess",function(t,i,n,o,a){e.currentPathHash="#"+f.url()}),e.dateDisplayText=function(e){if(p.isAuthenticated())return e?m.getDateTime(new Date(e)):""},p.isAuthenticated(),e.changeFilterView=function(e,t){S.setFilterView(e,t),S.setSelectedFilterView(e)},e.$on("api-version-changed",function(e,t){R.apiVersionChanged(function(){M.localStorage.setItem("x-api-version",t),w.logout()})})}]),setTimeout(function(){window.cordova&&navigator.splashscreen.hide()},1e3),angular.bootstrap(document,[app.name])});