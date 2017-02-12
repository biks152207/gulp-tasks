(function() {
    app.controller('addFilterController', ["$rootScope", "$scope", "labelService", "project", "filterService", "discardChange", "dbEnums", "guidGenerator", "message", "sharedData", "taskService", "userModel", "roleValidators", "$state", function($rootScope, $scope,  labelService, project, filterService, discardChange,
                                                   dbEnums, guidGenerator, message, sharedData, taskService, userModel,roleValidators,$state) {


        $scope.isAllAssigneeSelected = function(){
            var selected = true;
            for(var i = 0; i < $scope.assignees.length; i++){
                selected  = selected && $scope.assignees[i].checked;
            }
            $scope.filter.allAssignees = selected;
            return  $scope.filter.allAssignees;
        };

        $scope.isAllLabelSelected = function(){
            var selected = true;
            for(var i = 0; i < $scope.labels.length; i++){
                selected  = selected && $scope.labels[i].checked;
            }
            $scope.filter.allLabels = selected;
            return  $scope.filter.allLabels;
        };

        $scope.isAllPrioritySelected = function(){
            var selected = true;
            for(var i = 0; i < $scope.priorities.length; i++){
                selected  = selected && $scope.priorities[i].checked;
            }
            $scope.filter.allPriorities = selected;
            return  $scope.filter.allPriorities;
        };

        $scope.isAllProjectSelected = function(){
           var selected = true;
            for(var i = 0; i < $scope.projects.length; i++){
                selected  = selected && $scope.projects[i].checked;
           }
           $scope.filter.allProjects = selected;
            return  $scope.filter.allProjects;
        };

        $scope.selectAllAssignees = function(){
            for(var i = 0; i < $scope.assignees.length; i++){
                $scope.assignees[i].checked = $scope.filter.allAssignees;
            }
        };

        $scope.selectAllLabels = function(){

            for(var i = 0; i < $scope.labels.length; i++){
                $scope.labels[i].checked = $scope.filter.allLabels;
            }
        };

        $scope.selectAllPriorities = function(){

            for(var i = 0; i < $scope.priorities.length; i++){
                $scope.priorities[i].checked = $scope.filter.allPriorities;
            }
        };

        $scope.selectAllProjects = function(){

            for(var i = 0; i < $scope.projects.length; i++){
               $scope.projects[i].checked = $scope.filter.allProjects;
            }
        };

        $scope.getProjects = function(){

            $scope.projects = [];

            project.getAll().then(function(projects){
                if(projects) {
                    projects.splice(0, 0, sharedData.inbox);
                    projects.forEach(function (project){

                        $scope.projects.push({
                            checked : false,
                            project : project
                        });
                    });
                }
            });
        };

        $scope.getAssignees = function(){

            $scope.assignees = [];
            project.getAllProjectsUsers().then(function(list){
                if(list){
                    list.forEach(function (assignee){
                        $scope.assignees.push({
                            checked : false,
                            assignee : assignee
                        });
                    });
                    $scope.assignees = userModel.meTopOnList($scope.assignees, 'assignee');
                }
            });
        };

        $scope.getPriorities = function(){

            $scope.priorities = [];
            for(var key in taskService.priorities){
                $scope.priorities.push({
                    checked : false,
                    priority : taskService.priorities[key]
                });
            }
        };

        $scope.getLabels = function(){

            $scope.labels = [];

            labelService.getAll().then(function(labels){
                if(labels){
                    labels.forEach(function (label){

                        $scope.labels.push({
                            checked : false,
                            label : label
                        });
                    });
                }

            });

        };

        $scope.save = function(){

            $scope.form.$submitted = true;

            if ($scope.form.$valid) {
                var user=userModel.getLoggedInUser();
                roleValidators.checkUserRole(user,dbEnums.USER_ROLES.CUSTOM_FILTERS,{},true)
                    .then(function(){
                        $scope.filter.id = guidGenerator.getId();
                        $scope.filter.userId = userModel.getLoggedInId();
                        $scope.filter.projects =  $scope.filter.allProjects ? [] : filterService.setProjects($scope.projects);
                        $scope.filter.assignees = $scope.filter.allAssignees ? [] : filterService.setAssignees($scope.assignees);
                        $scope.filter.priorities = $scope.filter.allPriorities ? [] : filterService.setPriorities($scope.priorities);
                        $scope.filter.labels = $scope.filter.allLabels ? [] : filterService.setLabels($scope.labels);
                        $scope.filter.status = dbEnums.status.active;
                        $scope.filter.date_created = new Date();
                        $scope.filter.date_modified =  new Date();

                        filterService.addOrUpdate($scope.filter).then(function(results){

                            if(results){
                                $scope.form.$setPristine();
                                $scope.form.$setUntouched();
                                $scope.filter = {};
                                $rootScope.$emit('toast-message', message.successMessages.FILTER_SAVED);
                                discardChange.updateDiscardedBeforeSave();
                                $state.go('/filter/details',{id:results.id});
                                //sharedData.home();
                            }
                        });
                    });


            }

        };

        $scope.start = function (){

            $scope.fields = angular.copy(filterService.fields);
            $scope.dueDates =  filterService.dueDates;
            $scope.filter = {
                allProjects: false,
                allAssignees: false,
                allPriorities: false,
                allLabels: false
            };
            $rootScope.title = 'Add Filter';

            $scope.getProjects();
            $scope.getAssignees();
            $scope.getPriorities();
            $scope.getLabels();

            $rootScope.$emit('basic:header', null, null, $scope, true,null,true);
            discardChange.savePrevious($scope, $scope.filter);

        };

        $scope.toggleMenu = function(key){

            switch(key){
                case 'project':
                    $scope.fields.project = !$scope.fields.project;
                    break;
                case 'assignees':
                    $scope.fields.assignees = !$scope.fields.assignees;
                    break;
                case 'priority':
                    $scope.fields.priority = !$scope.fields.priority;
                    break;
                case 'label':
                    $scope.fields.label = !$scope.fields.label;
                    break;
                case 'dueDate':
                    $scope.fields.dueDate = !$scope.fields.dueDate;
                    break;
                default:
                    break;
            }

        };

        $scope.start();

        $scope.$on('$stateChangeStart', function (event, toState, toParams) {
            discardChange.changeState(event, toState, toParams, $scope.filter);
        });



    }]);
}).call(this);
