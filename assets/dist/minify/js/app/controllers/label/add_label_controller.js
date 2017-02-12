(function () {
    app.controller('addLabelController', ["$rootScope", "$scope", "$ionicModal", "discardChange", "userModel", "guidGenerator", "dbEnums", "sharedData", "labelService", "message", function ($rootScope, $scope, $ionicModal, discardChange,
                                                   userModel, guidGenerator, dbEnums, sharedData, labelService, message) {


        $scope.selectColor = function (color) {
            $scope.label.color = color;

        };

        $scope.saveKeyEnter = function(event){
            console.log('sds')
            if(event.keyCode == 13){
                $scope.save();
            }
        }

        $scope.save = function () {

            $scope.form.$submitted = true;

            if ($scope.form.$valid) {

                $scope.label.id = guidGenerator.getId();
                $scope.label.userId = userModel.getLoggedInId();
                $scope.label.tasks = [];
                $scope.label.status = dbEnums.status.active;
                $scope.label.date_created = new Date();
                $scope.label.date_modified = new Date();

                labelService.addOrUpdate($scope.label).then(function(results){

                    if(results){
                        $scope.form.$setPristine();
                        $scope.form.$setUntouched();
                        $scope.label = {};
                        $rootScope.$emit('toast-message', message.successMessages.LABEL_SAVED);
                        $rootScope.$emit('labelList-update');
                        discardChange.updateDiscardedBeforeSave();
                        sharedData.home();
                    }
                });

            }
        };

        $scope.start = function () {

            $scope.label = {};
            $scope.colors = sharedData.colorsCodes();
            $rootScope.title = 'Add Label';

            $rootScope.$emit('basic:header', null, null, $scope, true,null,true);
            discardChange.savePrevious($scope, $scope.label);

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


    }]);
}).call(this);
