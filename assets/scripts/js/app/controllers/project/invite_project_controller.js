(function () {
    app.controller('inviteProjectController', function ($rootScope, $scope, $state, $ionicPopup, $stateParams, project,
                                                          sharedData, message, stringService, dbEnums, userModel,roleValidators) {

        var submitType = {
            send: 'send',
            resend: 'resend',
            cancel:'cancel',
            remove: 'remove'
        };

        function getInvitedUser(email){
            var invitedUser = null;

            for (var i = 0; i < $scope.allUsers.length; i++) {
                if($scope.allUsers[i].email == email){
                    invitedUser = $scope.allUsers[i];
                    break;
                }
            }
            if(!invitedUser){
                invitedUser = {
                    email : email,
                    displayName :email,
                    displayShortName :stringService.firstLetter(email)
                };
            }
            var isInviterAdmin = project.getProjectAdmin($scope.project)._id ===userModel.getLoggedInId();
            invitedUser.isInviterAdmin = isInviterAdmin;
            invitedUser.invitedBy = userModel.getLoggedInId();
            invitedUser.role = isInviterAdmin ? dbEnums.projectUserRole.pending : dbEnums.projectUserRole.approval;
            invitedUser.invitationPending = true;
            invitedUser.isAdmin = false;

            return invitedUser;
        }

        function isUserExists(project, email){

            for (var i=0;i< project.users.length; i++){
                if(project.users[i].email === email) return true;
            }

            return false;
        }

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
                        $scope.form.$submitted = false;
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

        $scope.save = function(){

            $scope.form.$submitted = true;
            if ($scope.form.$valid) {

                $scope.invitation.email = $scope.selectedUser ? $scope.selectedUser.originalObject.email : $scope.form.iEmail.$$rawModelValue;
                console.log( $scope.invitation.email);
                if(isUserExists($scope.project, $scope.invitation.email)){

                    $scope.form.$setPristine();
                    $scope.form.$setUntouched();
                    $scope.invitation = {};
                    $rootScope.$emit('toast-message', message.errorMessages.EMAIL_ALREADY_EXISTS);
                }
                else{
                    var user=userModel.getLoggedInUser();

                    roleValidators.checkUserRole(user,dbEnums.USER_ROLES.MAX_USERS_PROJECT,{project:$scope.project},true)
                        .then(function(){
                            var thisUser = project.getProjectUserById($scope.project, userModel.getLoggedInId());

                            $scope.invitationPopUp(submitType.send,
                                thisUser.isAdmin ? message.infoMessages.PROJECT_INVITATION_SENT_BY_ADMIN : message.infoMessages.PROJECT_INVITATION_SENT_BY_USER);
                        });


                }


            }
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
                    $scope.project =proj;
                    $scope.project.users  = userModel.adminTopOnList($scope.project.users);
                    $scope.invitation = {};
                    $rootScope.title =  'Invite: ' + $scope.project.name;
                    $scope.loginId =userModel.getLoggedInId();
                    $scope.canDeleteUser=project.canDeleteUser(proj,userModel.getLoggedInUser());
                    $rootScope.$emit('basic:header', $state.current.state, $scope.project, $scope, true, 'Send');

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

        //$scope.selectUserInput(str){
        //    if(str && (str).trim().length>0){
        //        var user=userModel.getLoggedInUser();
        //        roleValidators.checkUserRole(user,dbEnums.USER_ROLES.MAX_USERS_PROJECT,{project:$scope.project,invitedUser:invitedUser},true);
        //    }
        //    else {
        //        //$scope.selectedUser=selectedUser;
        //    }
        //}
        $scope.searchInputFocus=function(){
            var user=userModel.getLoggedInUser();
            if(user){
                roleValidators.checkUserRole(user,dbEnums.USER_ROLES.MAX_USERS_PROJECT,{project:$scope.project,invitedUser:invitedUser},true);
            }


        }


    });
}).call(this);
