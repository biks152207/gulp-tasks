(function () {
    app.controller('listHeaderController', ["$rootScope", "$scope", "$state", "$ionicSideMenuDelegate", "date", "sortService", "platformService", "$ionicPopover", "rightMenuService", "sharedData", "notificationService", "taskService", "dbEnums", "userModel", "taskListView", function ($rootScope, $scope, $state, $ionicSideMenuDelegate, date, sortService, platformService,
                                                     $ionicPopover, rightMenuService, sharedData, notificationService, taskService,dbEnums,userModel,taskListView) {

        var header = $scope;
        var headerObject = {};
        var headerScope = {};
        header.sortService = sortService;
        $scope.searchBar={searchText:'',isVisible:false};

        if(userModel.isAuthenticated()) {
            notificationService.getNoOfUnseen().then(function(n){
                $scope.NoNN = n;
            });
        
        }

        $scope.items = [];


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

        function setNumberOfTasksTitle(number) {

            if(!number){
                $rootScope.numberOfTasks = 'No tasks';
            }
            else if (number == 1){
                $rootScope.numberOfTasks = '1 task';
            }
            else{
                $rootScope.numberOfTasks = number + ' tasks';
            }
        }

        header.home = function () {
            sharedData.home();
        };

        header.menuItemClicked = function (item, event) {
            header.popover.hide();
            rightMenuService.itemClicked(item, headerObject, header, event);
        };

        header.openNotificationBar = function(event){
           rightMenuService.openNotificationBar(event, header);
        };

        header.save = function () {
            if(headerScope){
                headerScope.save();
            }
        };

        header.searchStart =function(){
            $scope.focused = true;//!$scope.focused;
            $rootScope.$emit('search:start', $scope.focused);
            $rootScope.$emit('search:tasks',$scope.searchBar.searchText);
            if($scope.searchBar.searchText==''){
                taskListView.clearAllSelected();
            }

        };

        header.sendSearchText = function(text){
            if(!$scope.focused){
                $scope.focused = true;
                $rootScope.$emit('search:start', $scope.focused);
            }
            $rootScope.$emit('search:tasks',text);
        };


        header.searchOutOfFocus=function(txt){
            $scope.focused=false;
            $rootScope.$emit('search:start', (txt||'').length>0);
            //$scope.searchBar.isVisible = false;
        }

        header.clearClicked=function(){
            $scope.searchBar.searchText='';
            $scope.focused=false;
            $rootScope.$emit('search:start', false);
            $scope.searchBar.isVisible = false;
        }

        header.taskAdd = function(){

            if($state.current.state == sharedData.STATE.PROJECT){
                taskService.addProjectToTaskObject(headerObject);
            }
            $state.go('/task/add');
        };

        header.toggleMenu = function () {
            return $ionicSideMenuDelegate.toggleLeft();
        };

        header.toggleSearchBar = function (txt) {
            if(!$scope.searchBar.isVisible){
                $rootScope.$emit('search:start', true);
                $rootScope.$emit('search:tasks','');
                taskListView.clearAllSelected();
            }
            else{
                $scope.searchOutOfFocus(txt);
                //$rootScope.$emit('search:start', false);
            }
            $scope.searchBar.isVisible = !$scope.searchBar.isVisible;
            //header.searchStart($scope.searchBar);


        };



        var taskHeaderListener = $rootScope.$on('task:header-taskList', function (event, type, numberOfTasks, object, disabledOptions) {

            headerObject = object;
            setNumberOfTasksTitle(numberOfTasks);
            createPopover();
            rightMenuService.setMenu(type, object);
            header.menus = rightMenuService.getMenu();
            header.disabledOptions = disabledOptions;
            sortService.setAll(undefined,undefined,type).then(function(){

            });

            header.disabledOptions = platformService.isMobileDevice() || disabledOptions;


        });

        var taskHeaderScopeListener = $rootScope.$on('list:header-scope', function (event, scope) {
            headerScope = scope;
            header.disableModification=scope.taskObject.status==dbEnums.status.complete;
        });

        var NoNNListener = $rootScope.$on('NoNN-update', function (event, NoNN) {

            $scope.NoNN = NoNN;
            if(!$scope.$$phase) {
                $scope.$apply();
            }

        });

        var filterViewWatch=$rootScope.$watch('selectedFilterView',function(newVal,oldVal){
            if(newVal==oldVal)
                return;


        });

        header.$on('$destroy', function(){
            taskHeaderListener();
            taskHeaderScopeListener();
            NoNNListener();
            filterViewWatch();
        });

    }]);

}).call(this);
