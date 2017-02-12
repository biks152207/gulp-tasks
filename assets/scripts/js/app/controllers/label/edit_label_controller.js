(function () {
    app.controller('editLabelController', function ($rootScope, $state, $scope, $ionicModal,$stateParams,
                                                    labelService, sharedData, message, discardChange) {

        $scope.selectColor = function (color) {
            $scope.label.color = color;

        };

        $scope.saveKeyEnter = function(event){
            if(event.keyCode == 13){
                $scope.save();
            }
        }


        $scope.save = function () {

            $scope.form.$submitted = true;
            if ($scope.form.$valid) {
                if(discardChange.isChanged($scope.label)){
                    labelService.addOrUpdate($scope.label).then(function(results){

                        if(results){
                            $rootScope.$emit('toast-message', message.successMessages.LABEL_EDITED);
                            $rootScope.$emit('labelList-update');
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

            labelService.findById($stateParams.id).then(function(label){
                if(label){
                    $scope.label =label;
                    $rootScope.title = $scope.label.name;
                    $scope.colors = sharedData.colorsCodes();
                    $rootScope.$emit('basic:header', $state.current.state, $scope.label, $scope, true);
                    discardChange.savePrevious($scope, $scope.label);

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

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
            $scope.modal.remove();
            discardChange.changeState(event, toState, toParams, $scope.label);

        });


    });
}).call(this);
