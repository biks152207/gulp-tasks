(function(){app.config(["$stateProvider","$urlRouterProvider",function(e,t){e.state("/",{url:"/",onEnter:["sharedData","$state","userModel",function(e,t,r){r.isAuthenticated()?e.home():t.go("/login")}]}).state("/api-response",{url:"/api-response?state&param1&param2",onEnter:["$state","$stateParams","message","userModel","user",function(e,t,r,a,l){switch(t.state){case"login":t.param2?(r.setAlert(r.successMessages[t.param1]),a.setRequestLoginEmail(t.param2)):r.setAlert(r.errorMessages[t.param1]),a.isAuthenticated()&&l.logout(),e.go("/login")}}]}).state("/login",{url:"/login?returnUrl&params",views:{header:{templateUrl:"html/views/partials/login/header.html"},main:{controller:"loginController",templateUrl:"html/views/partials/login/login.html"}},cache:!1,requireLogin:!1,title:"Login"}).state("/register",{url:"/register",views:{header:{templateUrl:"html/views/partials/login/header.html"},main:{controller:"registerController",templateUrl:"html/views/partials/login/register.html"}},params:{accountDeleted:!1},cache:!1,requireLogin:!1,title:"Register"}).state("/activate",{url:"/activate?id",views:{main:{controller:"activateController",templateUrl:"html/views/shared/_blank.html"}},cache:!1,requireLogin:!1,title:"Activation"}).state("/forgot-password",{url:"/forgot-password",views:{header:{templateUrl:"html/views/partials/login/header.html"},main:{controller:"forgotPasswordController",templateUrl:"html/views/partials/login/forgot-password.html"}},cache:!1,requireLogin:!1,title:"Forgot_Password"}).state("/reset-password",{url:"/reset-password/:id",onEnter:["$rootScope","user","userModel",function(e,t,r){t.clearAll(),e.loggedIn=r.isAuthenticated()}],views:{header:{templateUrl:"html/views/partials/login/header.html"},main:{controller:"resetPasswordController",templateUrl:"html/views/partials/login/reset-password.html"}},cache:!1}),t.otherwise("/")}])}).call(this);