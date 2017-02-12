(function () {
    app.controller('addProjectController', function ($rootScope, $state, $scope, $ionicModal, userModel,
                                                     discardChange, project,  guidGenerator, dbEnums,  sharedData, message,$q,roleValidators) {

        $scope.openModal = function () {
            $scope.modal.show();
        };

        $scope.selectColor = function (color) {
            $scope.project.color = color;
        };

        $scope.saveKeyEnter = function(event){
            if(event.keyCode == 13){
                $scope.save();
            }
        }
        $scope.save = function () {

            $scope.form.$submitted = true;

            if ($scope.form.$valid) {
                $scope.project.id = guidGenerator.getId();
                $scope.project.status = dbEnums.status.active;
                $scope.project.date_created = new Date();
                $scope.project.date_modified = new  Date();
                $scope.project.updatedBy =  userModel.getLoggedInUser();


                $scope.project.users = [{
                    _id: userModel.getLoggedInId(),
                    lastName: userModel.getLoggedInLastName(),
                    firstName: userModel.getLoggedInFirstName(),
                    displayName: userModel.getLoggedInName(),
                    displayShortName: userModel.getLoggedInShortName(),
                    avatar: userModel.getAvatar(),
                    isAdmin:true,
                    email: userModel.getLoggedInEmail(),
                    role: dbEnums.projectUserRole.admin,
                    status: dbEnums.status.active

                }];


                var user=userModel.getLoggedInUser();
                var asyncTask=$q(function(resolve,reject){
                    return roleValidators.checkUserRole(user,dbEnums.USER_ROLES.ACTIVE_PROJECTS,{user:user},true)
                        .then(resolve,reject);
                });

                asyncTask.then(function(){
                    project.addOrUpdate($scope.project).then(function(results){
                        if(results){
                            $scope.form.$setPristine();
                            $scope.form.$setUntouched();
                            $scope.project = {};
                            $rootScope.$emit('toast-message', message.successMessages.PROJECT_SAVED);
                            $rootScope.$emit('projectList-update');
                            discardChange.updateDiscardedBeforeSave();
                            sharedData.home();
                        }
                    });
                });


            }
        };

        $scope.start = function () {

            $scope.project = {};
            $scope.colors = sharedData.colorsCodes();
            $rootScope.title = 'Add Project';
            $rootScope.$emit('basic:header', null, null, $scope, true,null,true);
            discardChange.savePrevious($scope, $scope.project);

            $ionicModal.fromTemplateUrl('html/views/modals/colour_codes.html', function ($ionicModal) {
                $scope.modal = $ionicModal;
            }, {
                scope: $scope,
                animation: 'scale-in'
            });

        };

        $scope.start();

        $scope.$on('$stateChangeStart', function (event, toState, toParams) {
            $scope.modal.remove();
            discardChange.changeState(event, toState, toParams, $scope.project);
        });


    });
}).call(this);
