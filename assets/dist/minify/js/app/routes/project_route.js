(function() {
    app.config(["$stateProvider", function($stateProvider) {

        var platform = ionic.Platform.platform();
        var isMobileDevice = platform === 'android' || platform === 'ios';
        $stateProvider.state('/project/add', {
            url: '/project/add',
            views: {
                header: {
                    controller: 'basicHeaderController',
                    templateUrl: 'html/views/shared/_basic_header.html'
                },
                main: {
                    templateUrl: 'html/views/partials/project/add_project.html'
                }
            },
            state: 'project',
            cache: false,
            requireLogin: true,
            title:'Project_Add'
        })
        .state('/accept-invitation', {
            url: '/accept-invitation?msg&email&projectId',
            onEnter: ["$rootScope", "$state", "$stateParams", "message", "userModel", "project", "user", "sharedData", function( $rootScope, $state, $stateParams, message, userModel, project, user, sharedData ) {


                    if($stateParams.projectId){
                        if($stateParams.email == userModel.getLoggedInEmail()){
                            sharedData.home();
                            $rootScope.$emit('toast-message', message.successMessages[$stateParams.msg]);
                        }
                        else{
                            message.setAlert(message.successMessages[$stateParams.msg]);
                            user.clearAll();
                            userModel.setRequestLoginEmail($stateParams.email);
                            $state.go('/login');
                        }
                    }
                    else{
                        message.setAlert(message.errorMessages[$stateParams.msg]);
                        if($stateParams.msg === 'EMAIL_NOT_FOUND'){
                            user.clearAll();
                            userModel.setRequestLoginEmail($stateParams.email);
                            $state.go('/register');
                        }
                        else user.logout();

                    }

            }]
        })
        .state('/approve-invitation', {
                url: '/approve-invitation?msg&email&projectId',
                onEnter: ["$rootScope", "$state", "$stateParams", "message", "userModel", "project", "user", "sharedData", function( $rootScope, $state, $stateParams, message, userModel, project, user, sharedData ) {


                    if($stateParams.projectId){
                        if($stateParams.email === userModel.getLoggedInEmail()){

                            $rootScope.$emit('toast-message', message.successMessages[$stateParams.msg]);
                            sharedData.home();
                        }
                        else{
                            message.setAlert(message.successMessages[$stateParams.msg]);
                            user.clearAll();
                            userModel.setRequestLoginEmail($stateParams.email);
                            $state.go('/login');
                        }
                    }
                    else{
                        $rootScope.$emit('toast-message', message.successMessages[$stateParams.msg]);
                    }

                }]
            })
        .state('/project/edit', {
                url: '/project/edit/:id',
                views: {
                    header: {
                        controller: 'basicHeaderController',
                        templateUrl: 'html/views/shared/_basic_header.html'
                    },
                    main: {
                        templateUrl: 'html/views/partials/project/edit_project.html'
                    }
                },
                state: 'project',
                cache: false,
                requireLogin: true,
                title:'Project_Edit'
            })
        .state('/project/details', {
            url: '/project/details/:id?focusMe',
            views: {
                header: {
                    controller: 'listHeaderController',
                    templateUrl: 'html/views/shared/_list_header.html'
                },
                main: {
                    controller: 'taskListController',
                    templateUrl: function(){
                        if(isMobileDevice){
                            return 'html/views/partials/task/list-mobile.html';
                        }
                        return 'html/views/partials/task/list-web.html';
                    }
                },
                'right-default-view':{
                    controller: 'defaultViewController',
                    templateUrl: 'html/views/shared/right-default-view.html'
                },
                footer: {
                    controller: 'taskFooterController',
                    templateUrl: 'html/views/shared/_task_footer.html'
                }
            },
            params:{'focusedTaskId':''},
            state: 'project',
            cache: false,
            requireLogin: true,
            isListView: true,
            sortKey:'project',
            title:'Project_Task_List'
        })
        .state('/project/users', {
            url: '/project/users/:id',
            views: {
                header: {
                    controller: 'basicHeaderController',
                    templateUrl: 'html/views/shared/_basic_header.html'
                },
                main: {
                    controller: 'viewUsersProjectController',
                    templateUrl: 'html/views/partials/project/view_users_project.html'
                }
            },
            state: 'project',
            cache: false,
            requireLogin: true,
            title:'Project_Users'
        })
        .state('/project/invite', {
            url: '/project/invite/:id',
            views: {
                header: {
                    controller: 'basicHeaderController',
                    templateUrl: 'html/views/shared/_basic_header.html'
                },
                main: {
                    templateUrl: 'html/views/partials/project/invite_project.html'
                }
            },
            state: 'project',
            cache: false,
            requireLogin: true,
            title:'Project_Invite'
        })
        .state('/approve-admin-invitation', {
            url: '/approve-admin-invitation?msg&email&projectId',
            onEnter: ["$rootScope", "$state", "$stateParams", "message", "userModel", "project", "user", "sharedData", "stringService", "$ionicPopup", function( $rootScope, $state, $stateParams, message, userModel, project, user, sharedData,stringService,$ionicPopup ) {


                if($stateParams.projectId){
                    if(userModel.isAuthenticated() && $stateParams.email === userModel.getLoggedInEmail()){

                        $rootScope.$emit('toast-message', message.infoMessages[$stateParams.msg]);
                        sharedData.home();
                    }
                    else{
                        message.setAlert(message.infoMessages[$stateParams.msg]);
                        user.logout();
                        userModel.setRequestLoginEmail($stateParams.email);
                        $state.go('/login');
                    }
                }
                else{
                    var msg=message.errorMessages[$stateParams.msg];
                    if(msg){
                        $ionicPopup.alert({
                            title: msg.title,
                            content: msg.message,
                            buttons: [{
                                text: stringService.OK,
                                onTap: function () {
                                    if(userModel.isAuthenticated()){
                                        sharedData.home();
                                    }
                                    else{
                                        $state.go('/login');
                                    }
                                    return false;
                                }
                            }]
                        });
                    }

                }

            }]
        })

    }]);

}).call(this);
