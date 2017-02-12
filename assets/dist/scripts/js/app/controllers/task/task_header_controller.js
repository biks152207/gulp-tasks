(function () {
    app.controller('taskHeaderController', ["$rootScope", "$state", "$scope", "$ionicPopover", "rightMenuService", "headerService", "user", "sharedData", "stringService", "notificationService", "dbEnums", "$ionicHistory", "navigationService", "userModel", function ($rootScope, $state, $scope, $ionicPopover, rightMenuService,
                                                      headerService, user, sharedData, stringService, notificationService,dbEnums,$ionicHistory,navigationService,userModel) {
        var header = $scope;
        header.type = stringService.EMPTY ;
        var headerObject = {};
        $scope.items = [];

        if(userModel.isAuthenticated()) {
            notificationService.getNoOfUnseen().then(function(n){
                $scope.NoNN = n;
            });
        }

        function createPopover(){

            $ionicPopover.fromTemplateUrl('html/views/popovers/top_right_popover.html', {
                scope: header,
                animation: "slide-in-right"
            }).then(function (popover) {
                header.popover = popover;
            });
            $ionicPopover.fromTemplateUrl('html/views/popovers/notification_popover.html', {
                scope: header
            }).then(function (notificationBar) {
                header.notificationBar = notificationBar;
            });

        }

        header.menuItemClicked = function (item, event) {

            header.popover.hide();
            rightMenuService.itemClicked(item, headerObject, header, event);

        };

        header.start = function(){
            createPopover();
            rightMenuService.setMenu(header.type);
            header.menus = rightMenuService.getMenu();
            header.createButtonName = headerService.taskHeader.createButtonName;
            header.createButtonLink = headerService.taskHeader.createButtonLink;
            header.noteButtonLink = headerService.taskHeader.noteButtonLink;
            header.taskObject=headerService.taskHeader.taskObject;
            header.taskId=headerService.taskHeader.taskId;
            header.createType=headerService.taskHeader.createType;
            header.addTab = headerService.taskHeader.addTab;
            header.noteTab = headerService.taskHeader.noteTab;
            header.isSaved = headerService.taskHeader.isSaved;
            header.disableModification=headerObject && headerObject.status==dbEnums.status.complete;
        };


        header.save = function () {
            if(headerService.activeScope){
                headerService.activeScope.save();
            }
            else $state.go('/task/add');

        };

        header.back = function () {
            navigationService.goBack();

        };

        var taskHeaderListener = $rootScope.$on('task:header', function(event, type, object){
            header.type = type;
            headerObject = object;

            header.start();
        });

        var NoNNListener = $rootScope.$on('NoNN-update', function (event, NoNN) {
            $scope.NoNN = NoNN;
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        });

        header.$on('$destroy', function(){

            taskHeaderListener();
            NoNNListener();
        });

        header.changeView=function(viewName,id){
            if(viewName=='task-add'){
                $state.go('/task/add');
            }
            else if(viewName=='task-edit'){
                $state.go('/task/edit',{id:id});
            }
            else if(viewName=='note'){
                $state.go('/task/note',{id:id});
            }
        }

    }]);
}).call(this);
