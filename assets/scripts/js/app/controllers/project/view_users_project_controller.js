(function () {
    app.controller('viewUsersProjectController', function ($rootScope, $scope, $state, $ionicPopup, $stateParams,
                                                        project,  sharedData, message, stringService, userModel) {

        var submitType = {
            send: 'send',
            resend: 'resend',
            cancel:'cancel',
            remove: 'remove'
        };

        function submit(type, user){

            switch(type){
                case submitType.send:

                    project.sendInvitation($scope.project, getInvitedUser($scope.invitation.email)).then(function(){
                        $scope.form.$setPristine();
                        $scope.form.$setUntouched();
                        $scope.invitation = {};
                    });
                    break;

                case submitType.resend:

                    var data = {
                        projectId: $scope.project.id,
                        user: user
                    };
                    project.reSendInvitation(data).then(function(results){
                        $rootScope.$emit('toast-message', results.message);
                    });
                    break;
                case submitType.cancel:

                    project.deleteUser($scope.project, user).then(function(){
                        $rootScope.$emit('toast-message', message.successMessages.PROJECT_INVITATION_CANCELLED);
                    });
                    break;
                case submitType.remove:

                    project.deleteUser($scope.project, user).then(function(){
                        $rootScope.$emit('toast-message', message.successMessages.PROJECT_USER_DELETED);
                    });
                    break;

            }
        }

        $scope.invitationPopUp = function(type, infoMsg, user){

            $ionicPopup.show({
                title: infoMsg.title,
                template: infoMsg.message,
                scope: $scope,
                buttons: [{
                    text: stringService.NO,
                    type: 'btn-no',
                    onTap: function () {
                        return true;
                    }
                },
                    {
                        text: stringService.YES,
                        type: 'btn-yes',
                        onTap: function () {
                            submit(type, user);
                        }
                    }]
            });

        };

        $scope.deleteUser = function (user) {

            $scope.invitationPopUp(submitType.remove, message.infoMessages.PROJECT_USER_DELETED, user);
        };

        $scope.reSendInvitation = function (user) {

            $scope.invitationPopUp(submitType.resend, message.infoMessages.PROJECT_INVITATION_RESENT, user);
        };

        $scope.deleteInvitation = function (user) {

            $scope.invitationPopUp(submitType.cancel, message.infoMessages.PROJECT_INVITATION_CANCELLED, user);
        };

        $scope.start = function() {

            project.findById($stateParams.id).then(function(proj){
                if(proj){
                    $scope.project = proj;
                    $scope.project.users  = userModel.adminTopOnList($scope.project.users);
                    $rootScope.title =  'Users: ' + $scope.project.name;
                    $scope.loginId =userModel.getLoggedInId();
                    $scope.canDeleteUser=project.canDeleteUser(proj,userModel.getLoggedInUser());
                    $rootScope.$emit('basic:header', $state.current.state, $scope.project, $scope);

                }
                else sharedData.home();

            });

            project.getAllProjectsUsers().then(function(list){
                $scope.allUsers = list;
            });

        };

        $scope.start();

        var projectListListener = $rootScope.$on('projectList-update', function () {

            project.findById($stateParams.id).then(function(project){
                if(project){
                        $scope.project = project;
                }
            });
        });


        $scope.$on('$destroy', function(){
            projectListListener();

        });


    });
}).call(this);



