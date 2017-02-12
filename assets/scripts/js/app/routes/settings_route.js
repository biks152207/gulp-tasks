(function() {
    app.config(function($stateProvider) {
        $stateProvider.state('/settings', {
                url: '/settings',
                views: {
                    header: {
                        controller: 'basicHeaderController',
                        templateUrl: 'html/views/shared/_basic_header.html'
                    },
                    main: {
                        controller: 'indexSettingController',
                        templateUrl: 'html/views/partials/settings/index.html'
                    }
                },
                cache: false,
                requireLogin: true,
                title:'Settings'
            })
        .state('/settings/about', {
                url: '/settings/about',
                views: {
                    header: {
                        controller: 'basicHeaderController',
                        templateUrl: 'html/views/shared/_basic_header.html'
                    },
                    main: {
                        controller: 'aboutSettingController',
                        templateUrl: 'html/views/partials/settings/about.html'
                    }
                },
                cache: false,
                requireLogin: true,
                title:'Settings_About'
            })
        .state('/settings/general', {
            url: '/settings/general',
            views: {
                header: {
                    controller: 'basicHeaderController',
                    templateUrl: 'html/views/shared/_basic_header.html'
                },
                main: {
                    controller: 'generalSettingController',
                    templateUrl: 'html/views/partials/settings/general.html'
                }
            },
            cache: false,
            requireLogin: true,
                title:'Settings_General'
        })
            .state('/settings/reminder', {
                url: '/settings/reminder',
                views: {
                    header: {
                        controller: 'basicHeaderController',
                        templateUrl: 'html/views/shared/_basic_header.html'
                    },
                    main: {
                        controller: 'reminderSettingController',
                        templateUrl: 'html/views/partials/settings/reminder.html'
                    }
                },
                cache: false,
                requireLogin: true,
                title:'Settings_Reminders'
            })
        .state('/settings/notifications', {
                url: '/settings/notifications',
                views: {
                    header: {
                        controller: 'basicHeaderController',
                        templateUrl: 'html/views/shared/_basic_header.html'
                    },
                    main: {
                        controller: 'notificationsSettingController',
                        templateUrl: 'html/views/partials/settings/notifications.html'
                    }
                },
                cache: false,
                requireLogin: true,
                title:'Settings_Notifications'
            })
        .state('/settings/test', {
            url: '/settings/test',
            views: {
                header: {
                    controller: 'basicHeaderController',
                    templateUrl: 'html/views/shared/_basic_header.html'
                },
                main: {
                    controller: 'testSettingController',
                    templateUrl: 'html/views/partials/settings/test.html'
                }
            },
            cache: false,
            requireLogin: true
        })
        .state('/settings/account', {
                url: '/settings/account',
                views: {
                    header: {
                        controller: 'basicHeaderController',
                        templateUrl: 'html/views/shared/_basic_header.html'
                    },
                    main: {
                        controller: 'accountSettingController',
                        templateUrl: 'html/views/partials/settings/account.html'
                    }
                },
                cache: false,
                requireLogin: true,
                title:'Settings_Account'
            })
            .state('/update-email-confirm', {
                url: '/update-email-confirm?msg&email',
                onEnter: function( $rootScope, $state, $stateParams, message, userModel, project, user ) {

                    if($stateParams.email){

                        message.setAlert(message.successMessages[$stateParams.msg]);
                        userModel.setRequestLoginEmail($stateParams.email);

                    }
                    else {
                        message.setAlert(message.errorMessages[$stateParams.msg]);
                    }
                    user.clearAll();
                    $state.go('/login');

                }
            })

    });

}).call(this);
