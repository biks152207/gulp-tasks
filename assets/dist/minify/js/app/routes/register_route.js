(function() {
    app.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
        $stateProvider .state('/', {
            url: '/',
            onEnter: ["sharedData", "$state", "userModel", function(sharedData, $state, userModel) {

                if(userModel.isAuthenticated()){
                    sharedData.home();
                }
                else $state.go('/login');
            }]
            })
            .state('/api-response', {
                url: '/api-response?state&param1&param2',
                onEnter: ["$state", "$stateParams", "message", "userModel", "user", function( $state, $stateParams, message, userModel, user ) {
                    switch($stateParams.state) {
                        case 'login':
                            //successful verification if param2 exists
                            if($stateParams.param2){
                                message.setAlert(message.successMessages[$stateParams.param1]);
                                userModel.setRequestLoginEmail($stateParams.param2);
                            }
                            else  message.setAlert(message.errorMessages[$stateParams.param1]);
                            if(userModel.isAuthenticated()){
                                user.logout();
                            }

                            $state.go('/login');
                            break;
                    }

                }]
            })
            .state('/login', {
                url: '/login?returnUrl&params',
                views: {
                    header: {
                        templateUrl: 'html/views/partials/login/header.html'
                    },
                    main: {
                        controller: 'loginController',
                        templateUrl: 'html/views/partials/login/login.html'
                    }
                },
                cache: false,
                requireLogin: false,
                title:'Login'

            })
            .state('/register', {
                url: '/register',
                views: {
                    header: {
                        templateUrl: 'html/views/partials/login/header.html'
                    },
                    main: {
                        controller: 'registerController',
                        templateUrl: 'html/views/partials/login/register.html'
                    }
                },
                params:{'accountDeleted':false},
                cache: false,
                requireLogin: false,
                title:'Register'
            })
            .state('/activate', {
                url: '/activate?id',
                views: {
                    main: {
                        controller: 'activateController',
                        templateUrl: 'html/views/shared/_blank.html'
                    }
                },
                cache: false,
                requireLogin: false,
                title:'Activation'
            })
            .state('/forgot-password', {
                url: '/forgot-password',
                views: {
                    header: {
                        templateUrl: 'html/views/partials/login/header.html'
                    },
                    main: {
                        controller: 'forgotPasswordController',
                        templateUrl: 'html/views/partials/login/forgot-password.html'
                    }
                },
                cache: false,
                requireLogin: false,
                title:'Forgot_Password'
            })
            .state('/reset-password', {
                url: '/reset-password/:id',
                onEnter: ["$rootScope", "user", "userModel", function($rootScope, user, userModel) {
                    user.clearAll();
                    $rootScope.loggedIn = userModel.isAuthenticated();
                }],
                views: {
                    header: {
                        templateUrl: 'html/views/partials/login/header.html'
                    },
                    main: {
                        controller: 'resetPasswordController',
                        templateUrl: 'html/views/partials/login/reset-password.html'
                    }
                },
                cache: false
                //requireLogin: false
            });
       $urlRouterProvider.otherwise('/');

    }]);

}).call(this);
