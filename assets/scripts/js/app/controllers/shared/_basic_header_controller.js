(function () {
    app.controller('basicHeaderController', function ($rootScope, $state, $ionicHistory, $scope, $ionicPopover, $ionicLoading, $ionicSideMenuDelegate,
                                                      $ionicPopup, sharedData, project, labelService, filterService, user, rightMenuService, notificationService,navigationService,userModel) {

        var header = $scope;
        var headerObject = {};
        var activeScope = null;
        $scope.items = [];
        if(userModel.isAuthenticated()){
            notificationService.getNoOfUnseen().then(function(n){
                $scope.NoNN = n;
            });
        }


        function createPopover(){

            $ionicPopover.fromTemplateUrl('html/views/popovers/top_right_popover.html', {
                scope: header
            }).then(function (popover) {
                header.popover = popover;
            });

            $ionicPopover.fromTemplateUrl('html/views/popovers/notification_popover.html', {
                scope: header
            }).then(function (notificationBar) {
                header.notificationBar = notificationBar;
            });

        }

        header.buttonClicked = function (e) {
            if(e){
                e.stopPropagation();
            }

           activeScope.save();
        };

        header.toggleMenu = function () {
            return $ionicSideMenuDelegate.toggleLeft();
        };

        header.menuItemClicked = function (item, event) {
            header.popover.hide();
            rightMenuService.itemClicked(item, headerObject, header, event);
        };

        header.back = function () {
            navigationService.goBack();
            //var previousView = $ionicHistory.backView();
            //previousView ? $state.go(previousView.stateName, previousView.stateParams) : sharedData.home();
        };

        header.home = function () {
            sharedData.home();
        };

        var basicHeaderListener = $rootScope.$on('basic:header', function(event, type, object, scope, buttonEnabled, buttonTitle, hasBackButton){

            headerObject = object;
            header.buttonEnabled = buttonEnabled;
            header.hasBackButton = hasBackButton;
            header.buttonTitle = buttonTitle || 'Save';
            createPopover();
            rightMenuService.setMenu(type, object);
            header.menus = rightMenuService.getMenu();
            activeScope = scope;
        });

        var NoNNListener = $rootScope.$on('NoNN-update', function (event, NoNN) {
            $scope.NoNN = NoNN;
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        });

        header.$on('$destroy', function(){

            basicHeaderListener();
            NoNNListener();
        });

    });

}).call(this);
