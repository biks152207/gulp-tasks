(function () {
    app.controller('editProjectController', function ($rootScope, $state, $scope, $ionicModal, $stateParams, userModel,
                                                      $timeout, sharedData, project, message,  discardChange) {


       /* function isChanged(tProject){
            return tProject.name != tProject.current.name || tProject.color != tProject.current.color;
        }*/

        $scope.openModal = function () {
            $scope.modal.show();
        };

        $scope.selectColor = function (color) {
            $scope.project.color = color;
            $scope.project.border = 'none';
        };

        $scope.saveKeyEnter = function(event){
            if(event.keyCode == 13){
                $scope.save();
            }
        }
        
        $scope.save = function () {

            $scope.form.$submitted = true;
            if ($scope.form.$valid) {
                 if(discardChange.isChanged($scope.project)){
                     $scope.project.updatedBy =  userModel.getLoggedInUser();
                     project.addOrUpdate($scope.project, true).then(function(results){

                         if(results){
                             $rootScope.$emit('toast-message', message.successMessages.PROJECT_EDITED);
                             $rootScope.$emit('projectList-update');
                             discardChange.updateDiscardedBeforeSave();
                             sharedData.home();
                         }
                     });
                 }
                else {
                     discardChange.updateDiscardedBeforeSave();
                     sharedData.home();
                 }

            }
        };

        $scope.start = function () {

            project.findById($stateParams.id).then(function(project){
                if(project){
                    $scope.project =project;

                    $rootScope.title = $scope.project.name;
                    $scope.colors = sharedData.colorsCodes();
                    $rootScope.$emit('basic:header', $state.current.state, $scope.project, $scope, true);
                    discardChange.savePrevious($scope, $scope.project);

                }
                else sharedData.home();

            });

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
