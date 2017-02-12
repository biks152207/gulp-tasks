(function () {
    app.controller('leftMenuController', function ($scope, $rootScope, $state,  $ionicPopup, $ionicScrollDelegate, $ionicHistory,
                                                   project, labelService,  sharedData, message, filterService, stringService, sortService,taskListView,$q,$timeout,userModel,roleValidators,dbEnums) {

        $scope.canUserFilter=false;
        $scope.selectedId = undefined;
        $scope.leftMenuKey = undefined
        $scope.child_menu_key = undefined;
        $scope.redirect = function (key) {
            $scope.selectedId = undefined;
            $scope.leftMenuKey = undefined;
            $ionicHistory.nextViewOptions({
                disableAnimate: true
            });
            switch (key) {
                case 'myFeed':
                    canSeeFeeds()
                        .then(function(){
                            $state.go('/task/my-feed');
                        });

                    //taskListView.setSelectedFilterView('project');
                    break;
                default:
                        sortService.setFilterTypeByValue(key);
                    sortService.setAll(undefined,undefined,key).then(function(){
                        $state.go('/task/list/', {type: key, id: null});
                    });
                    //taskListView.setSelectedFilterView('project');

                    break;
            }
        };
        $scope.edit = function ( key,id) {

            function navigateTo(){
                $ionicHistory.nextViewOptions({
                    disableAnimate: true
                });
                var url = '/' + key + '/edit';
                $state.go(url, {'id': id});
            }
            if(key=='filter'){
                canDoFilter()
                    .then(navigateTo);
            }
            else if(key=='label'){
                canDoLabel()
                    .then(navigateTo);
            }
            else{
                navigateTo();
            }
        };



        $scope.set_parent_selected = function(key){

            if($scope.child_menu_key != $scope.leftMenuKey){
                $scope.selectedId = undefined;
            }
            console.log($scope.leftMenuKey + ' left')
            console.log($scope.child_menu_key + ' child')
            if($scope.leftMenuKey == key){
                return {
                    fontWeight: "bold"
                }
            }
        }


        $scope.set_child_selected = function (id,key) {
            console.log('ok-1')
            $scope.child_menu_key = key;
            console.log($scope.child_menu_key + ' selected')
            if ($scope.selectedId == id) {
                return {
                    fontWeight: "bold"
                }
            }
        }

        $scope.details = function (key, id) {
            $scope.selectedId = id;
            $scope.leftMenuKey = key;
            function navigateTo(){
                //clearEditView();
                var url = '/' + key + '/details';
                $ionicHistory.nextViewOptions({
                    disableAnimate: true
                });
                var noFilter = key != sharedData.LEFT_MENU_KEYS.FILTER;

                sortService.setAll(id, noFilter,key).then(function(){

                    $state.go(url, {'id': id});
                });
                //taskListView.setSelectedFilterView(key);
            }

            if(key=='filter'){
                canDoFilter()
                    .then(navigateTo);
            }
            else{
                navigateTo();
            }

        };

        $scope.archive = function (data) {
            var infoMsg = message.infoMessages.PROJECT_ARCHIVED_CONFIRMATION;
            $ionicPopup.show({
                title: infoMsg.title,
                template: infoMsg.message,
                scope: $scope,
                buttons: [{
                    text: stringService.NO,
                    onTap: function () {
                        return true;
                    }
                },
                    {
                        text: stringService.YES,
                        onTap: function () {
                            project.archive(data).then(function (results) {
                                if(results){
                                    $rootScope.$emit('toast-message', message.successMessages.PROJECT_ARCHIVED);
                                    $rootScope.$emit('projectList-update');
                                }
                            });

                        }
                    }]
            });

        };

        $scope.unArchive = function (data) {
            var infoMsg = message.infoMessages.PROJECT_UNARCHIVED_CONFIRMATION;
            $ionicPopup.show({
                title: infoMsg.title,
                template: infoMsg.message,
                scope: $scope,
                buttons: [{
                    text: stringService.NO,
                    onTap: function () {
                        return true;
                    }
                },
                    {
                        text: stringService.YES,
                        onTap: function () {
                            project.unArchive(data).then(function (results) {
                                if(results){
                                    $rootScope.$emit('toast-message', message.successMessages.PROJECT_UNARCHIVED);
                                    $rootScope.$emit('projectList-update');
                                }
                            });

                        }
                    }]
            });

        };

        $scope.removeLabel = function (data) {
            var infoMsg = message.infoMessages.LABEL_DELETE_CONFIRMATION;
            $ionicPopup.show({
                title: infoMsg.title,
                template: infoMsg.message,
                scope: $scope,
                buttons: [{
                    text: stringService.NO,
                    onTap: function () {
                        return true;
                    }
                },
                    {
                        text: stringService.YES,
                        onTap: function () {

                            labelService.delete(data).then(function (results) {
                                if(results){
                                    $rootScope.$emit('toast-message', message.successMessages.LABEL_DELETED);
                                    $rootScope.$emit('labelList-update');
                                }
                            });
                        }
                    }]
            });
        };

        $scope.removeFilter = function (data) {
            var infoMsg = message.infoMessages.FILTER_DELETE_CONFIRMATION;
            $ionicPopup.show({
                title: infoMsg.title,
                template: infoMsg.message,
                scope: $scope,
                buttons: [{
                    text: stringService.NO,
                    onTap: function () {
                        return true;
                    }
                },
                    {
                        text: stringService.YES,
                        onTap: function () {
                            filterService.delete(data).then(function (results) {
                                if(results){
                                    $rootScope.$emit('toast-message', message.successMessages.FILTER_DELETED);
                                    $rootScope.$emit('filterList-update');
                                }
                            });
                        }
                    }]
            });
        };


        $scope.setDropdowns = function(){
            $scope.dropdowns = {
                project: false,
                assignee: false,
                filter: false,
                label: false
            };
        };

        $scope.setSettings = function(){
            $scope.settings={
                project : false,
                assignee: false,
                filter: false,
                label: false
            };
        };

        $scope.toggleDropdown = function(key){
            $scope.leftMenuKey = key;
            $scope.selectedId = undefined;
            //$scope.set_parent_selected(key)
            //$scope.setDropdowns()
            $scope.dropdowns[key] = !$scope.dropdowns[key];
            $ionicScrollDelegate.resize();
        };

        $scope.start = function() {

            $scope.setDropdowns();
            $scope.setSettings();
            $scope.leftMenuSingleItems = sharedData.leftMenuSingleItems();

            project.getAll().then(function(list){
                 $scope.activeProjects =list;

            });

            project.getAllArchived().then(function(list){
                $scope.archiveProjects =list;

            });
            labelService.getAll().then(function(list){
                $scope.labels = list;
            });
            filterService.getAll().then(function(list){
                $scope.filters = list;
                canDoFilter(true)
                    .then(function(){
                       $scope.canUserFilter=true;
                    });

            });
            project.getAllProjectsUsers().then(function(list){
                $scope.assignees = list;
            });

        };

        $scope.start();

        $scope.onReorder = function (fromIndex, toIndex, key) {
            var defer=$q.defer();
            var projects=angular.copy($scope.activeProjects);

            var moved = projects.splice(fromIndex, 1);
            projects.splice(toIndex, 0, moved[0]);
            //var moved = projects.splice(fromIndex, 1);
            //projects.splice(toIndex, 0, moved[0]);
            unSubscribeProjectListListener();
            //$scope.activeProjects=projects;
            project.reorder(projects,function(){



                subscribeProjectListListener();
            });
            //$timeout(function(){
            //    $scope.activeProjects=projects;
            //    defer.resolve();
            //},500);
             $scope.activeProjects=projects;
            defer.resolve();
            return defer.promise;
        };

        var projectListListener;

        function unSubscribeProjectListListener(){
            if(projectListListener){
                projectListListener();
                projectListListener=null;
            }
        }

        function subscribeProjectListListener(){
            unSubscribeProjectListListener();
            projectListListener = $rootScope.$on('projectList-update', function () {
                console.log('projectList-update called');
                project.getAll().then(function(list){
                    $scope.activeProjects =list;

                });
                project.getAllArchived().then(function(list){
                    $scope.archiveProjects =list;

                });
                project.getAllProjectsUsers().then(function(list){
                    $scope.assignees = list;
                });
            });
        }

        subscribeProjectListListener();

        //var projectListListener = $rootScope.$on('projectList-update', function () {
        //    console.log('projectList-update called');
        //    project.getAll().then(function(list){
        //        $scope.activeProjects =list;
        //
        //    });
        //    project.getAllArchived().then(function(list){
        //        $scope.archiveProjects =list;
        //
        //    });
        //    project.getAllProjectsUsers().then(function(list){
        //        $scope.assignees = list;
        //    });
        //});

        var taskListListener=$rootScope.$on('taskList-update',function(){
            project.getAll().then(function(list){
                $scope.activeProjects =list;

            });
        });

        var labelListListener = $rootScope.$on('labelList-update', function () {
            labelService.getAll().then(function(list){
                $scope.labels = list;
            });
        });

        var filterListListener = $rootScope.$on('filterList-update', function () {
            filterService.getAll().then(function(list){
                $scope.filters = list;

            });

        });

        var menuSelectedListener = $rootScope.$on('left-menu:selected', function (event, selected) {

           $scope.selected = selected;
        });


        $scope.$on('$destroy', function(){
            projectListListener();
            taskListListener();
            labelListListener();
            filterListListener();
            menuSelectedListener();

        });

        function clearEditView(){
            $rootScope.rightDefaultViewVisible = false;
            $rootScope.default = {
                edit: false
            };
        }

        $scope.addLabel=function($event){

            canDoLabel()
                .then(function() {
                    //console.log('lbl added ' + label.name);
                    $state.go('/label/add');
                });

        };

        function canDoLabel(){
            var user=userModel.getLoggedInUser();
            return roleValidators.checkUserRole(user,[dbEnums.USER_ROLES.LABELS],{label:null,user:user},true);
        }

        $scope.addProject=function(){
            var user=userModel.getLoggedInUser();
            var asyncTask=$q(function(resolve,reject){
                roleValidators.checkUserRole(user,dbEnums.USER_ROLES.ACTIVE_PROJECTS,{user:user},true)
                    .then(resolve,reject);
            });

            asyncTask.then(function() {
                $state.go('/project/add');
            });

        };

        $scope.addFilter=function(){
            canDoFilter()
                .then(function(){

                    $state.go('/filter/add');

                })


        };

        function canDoFilter(suppressWarning){
            var user=userModel.getLoggedInUser();
            var asyncTask=$q(function(resolve,reject){
                roleValidators.checkUserRole(user,dbEnums.USER_ROLES.CUSTOM_FILTERS,{user:user},!suppressWarning)
                    .then(resolve,reject);
            });
            return asyncTask

        }

        function canSeeFeeds(suppressWarning){
            var user=userModel.getLoggedInUser();
            var asyncTask=$q(function(resolve,reject){
                roleValidators.checkUserRole(user,dbEnums.USER_ROLES.MY_FEEDS,{user:user},!suppressWarning)
                    .then(resolve,reject);
            });
            return asyncTask
        }



    })

}).call(this);
