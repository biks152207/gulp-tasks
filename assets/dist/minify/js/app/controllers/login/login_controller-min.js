(function(){app.controller("loginController",["$scope","$stateParams","$state","$ionicLoading","TodoZuDB","user","sharedData","message","userModel","pushNotification","connectivity","$timeout","$q","$rootScope",function(e,i,t,n,o,s,c,a,r,l,d,g,u,f){e.credentials={},e.isReady=!1,e.showMessage=function(i){e.alert={title:i.title,msg:i.message,success:i.success}},e.login=function(){o.dropDatabase(),e.credentials.email&&e.credentials.password&&(e.credentials.deviceInfo=e.credentials.deviceInfo||{},e.credentials.deviceInfo.uid=r.getDeviceUniqueId(),e.credentials.deviceInfo.device_type=ionic.Platform.platform(),e.credentials.deviceInfo.device_token=r.getDeviceToken(),n.show(),f.isLoginProgress=!0,s.login(e.credentials).then(function(i){e.alert={},i.error?e.showMessage(i.message):(c.home(),f.$emit("connect-socket"),f.$emit("login-success"))}).finally(function(){f.isLoginProgress=!1,g(function(){n.hide()},200)}))},e.start=function(){d.checkConnection()&&(e.credentials.deviceInfo={uid:r.getDeviceUniqueId(),device_type:ionic.Platform.platform(),device_token:r.getDeviceToken()});var i=r.getRequestLoginEmail();i&&(e.credentials.email=i,r.removeRequestLoginEmail()),e.alert=a.getAlert(),a.clearAlert()},e.start()}])}).call(this);