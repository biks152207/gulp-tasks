(function () {
    app.directive('tdzAttachmentViewer', [ '$ionicModal','platformService','CONSTANT','authService',
                            function ( $ionicModal,platformService,CONSTANT,authService) {
        return {

            scope: {
                fileName: '=',
                fileUrl: '='
            },
            transclude:true,
            require:'^tdzAttachmentViewer',
            template:'<div class="attachment-content"><div ng-if="isAnImage" style="height:auto"><img ng-src="{{fullFileUrl}}" class="attachment-thumbnail" ng-click="openAttachment($event)"/></br></div>'+
                    '<span class="icon tdzicon-attach attachment-icon-left" ng-if="!isAnImage">&nbsp;<br/></span>'+
                    '<div ng-click="openAttachment($event)" class="all-wrapped attachment-filename">{{fileName}}</div>'+
                    '<ng-transclude></ng-transclude></div>',
            controller:['$scope',function($scope){
                var self=this;
                self.isAnImage=function(filename){
                    var validImageFormats = ['jpg', 'gif', 'png', 'jpeg'];
                    var ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();

                    return validImageFormats.indexOf(ext) !== -1;
                };

               $scope.$watch('fileName',function(newVal,oldVal){
                   if(newVal===oldVal){
                       return;
                   }
                   $scope.isAnImage=self.isAnImage(newVal);

               }) ;

                $scope.$watch('fileUrl',function(newVal,oldVal){
                    if(newVal){
                        var authToken=authService.getAccessToken();
                        $scope.fullFileUrl=CONSTANT.file_handler_link+'/attachment?x-access-token='+authToken+'&url='+newVal;
                    }

                });

                $scope.isAnImage=self.isAnImage($scope.fileName);

            }],
            link: function ($scope, $element, attrs,ctrls) {


                var tdzCtrl=ctrls;
                function createModals(){

                    $ionicModal.fromTemplateUrl('html/directives/shared/attachment-viewer.html', function ($ionicModal) {
                        $scope.modal = $ionicModal;
                        $scope.modal.show();
                    }, {
                        scope: $scope,
                        animation: 'scale-in'
                    });

                }

                $scope.openAttachment=function($event){
                    $event.stopPropagation();
                    if(tdzCtrl.isAnImage($scope.fileName)){
                        $scope.src =  $scope.fullFileUrl;
                        createModals();
                    }
                    else{
                        $scope.openFile();
                        return;
                    }

                }


                //$element.on('click', function () {
                //        if(tdzCtrl.isAnImage($scope.fileName)){
                //            $scope.src =  $scope.fileUrl;
                //        }
                //        else{
                //            $scope.openFile();
                //            return;
                //        }
                //
                //    createModals();
                //
                //});

                $scope.openFile = function(){
                    if(window.cordova){
                        console.log('opening file ::: '+$scope.fullFileUrl);
                        //cordova.plugins.fileOpener2.open(
                        //    $scope.fileUrl
                        //);
                        var canOpenFile=canOpenInAppBrowser($scope.fullFileUrl,
                            //platformService.getPlatform()
                            "android"
                        );
                        var fileUrl=$scope.fullFileUrl;
                        //if(!canOpenFile){
                        //    fileUrl='https://docs.google.com/gview?embedded=true&url='+$scope.fileUrl;
                        //}

                        //cordova.InAppBrowser
                        window
                            .open(
                            encodeURI(fileUrl), '_system', 'location=no');
                        //cordova.InAppBrowser.open(  $scope.fileUrl, '_blank', 'location=yes');
                    }
                    else{
                        window.open(
                            $scope.fullFileUrl,
                            '_blank'
                        );
                    }

                }

            }
        };
    }]);

    function canOpenInAppBrowser(fileName,platform){
        fileName=fileName+"";
        var androidNotSupportedFileTypes=["pdf"];
        var iosNotSupportedFileTypes=[];
        var allUnsupported=[];

        if(platform=="android"){
            allUnsupported=allUnsupported.concat(androidNotSupportedFileTypes);
        }
        else if(platform=="ios"){
            allUnsupported=allUnsupported.concat(iosNotSupportedFileTypes);
        }
        //allUnsupported=allUnsupported.concat(androidNotSupportedFileTypes).concat(iosNotSupportedFileTypes);
        var fileExtensionIdx=fileName.lastIndexOf(".");
        if(fileExtensionIdx<0){
            return true;
        }
        else{
            var fileExtension=fileName.substr(fileExtensionIdx+1,3);
            if(allUnsupported.indexOf(fileExtension.toLowerCase())>-1){
                return false;
            }
            else{
                return true;
            }
        }
    }
}).call(this);
