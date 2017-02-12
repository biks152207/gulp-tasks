(function(){
    app.directive('tdzImagepicker',[ '$ionicModal','$rootScope', 'message', '$ionicLoading', 'Cropper', '$timeout', 'settingsService',
                                    'userModel', 'guidGenerator',
        function($ionicModal, $rootScope, message, $ionicLoading, Cropper, $timeout, settingsService, userModel, guidGenerator){

        return {
            require: "ngModel",
            scope:{
                ngModel: "="
            },
            link: function($scope, $element, attrs, ngModelController){

                $scope.width  = 300;
                var imageDeleted = false;
                var file ;
                function createModal(){
                    $ionicModal.fromTemplateUrl('html/directives/shared/image_picker.html', function ($ionicModal) {
                        $scope.modal = $ionicModal;
                        $scope.modal.show();
                    }, {
                        scope: $scope,
                        animation: 'scale-in'
                    });
                }
                $element.on("click",function(){
                    //if(connectivity.isConnected()){
                        $scope.dataUrl = $scope.ngModel;

                        $timeout(createModal());

                    //}
                   // else {
                   //     $rootScope.$emit('toast-message', message.errorMessages.CONNECTION_REQUIRED);
                   // }

                });

                $scope.clear = function(){
                    $scope.dataUrl = null;
                    file = null;
                    imageDeleted = true;

                };

                $scope.close = function(){
                   $scope.dataUrl = null;
                  $scope.modal.remove();
                };

                $scope.onFileSelected = function(files){

                    if (files && files.length) {
                        Cropper.encode((file = files[0]))
                            .then(function(dataUrl) {
                                $scope.dataUrl = dataUrl;
                                $timeout(showCropper);
                            });
                    }
                };

                $scope.uploadAndSave = function() {

                    if(file){
                        $ionicLoading.show();
                        Cropper.crop(file, data)
                            .then(function(blob) {
                                return Cropper.scale(blob, {
                                    width: $scope.width
                                });
                            })
                            .then(function(blob) {

                                blob.name = file.name;

                                var data = {
                                    parent: userModel.getLoggedInId(),
                                    id: guidGenerator.getId(),
                                    file: blob
                                };
                                settingsService.uploadAvatar(data).then(function(results){
                                    $rootScope.$emit('toast-message', results.msg);
                                    $ionicLoading.hide();

                                });
                        });
                    }
                    else if(imageDeleted) {
                        settingsService.removeAvatar({
                            userId:userModel.getLoggedInId(),
                            avatar: null
                        }).then(function(results){
                            $rootScope.$emit('toast-message', results.msg);
                            $ionicLoading.hide();

                        })
                    }
                    $scope.close();

                };

                $scope.showEvent = 'show';
                $scope.hideEvent = 'hide';

                $scope.options = {
                    maximize: true,
                    aspectRatio: 1,
                    guides: false,
                    crop: function(dataNew) {
                        data = dataNew;
                    }
                };

                function showCropper() {$scope.$broadcast($scope.showEvent); }


            }
        }

    }]);

}).call(this);