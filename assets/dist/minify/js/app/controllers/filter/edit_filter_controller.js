(function() {
    app.controller('editFilterController', ["$rootScope", "$state", "$scope", "$stateParams", "project", "taskService", "labelService", "filterService", "message", "sharedData", "userModel", "discardChange", "dbEnums", "roleValidators", function($rootScope, $state, $scope, $stateParams, project, taskService,
                                                    labelService, filterService, message, sharedData, userModel, discardChange,dbEnums,roleValidators) {


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

        $scope.getProjects = function(prevProjects, selectAll){

            $scope.projects = [];

            project.getAll().then(function(projects){
                if(projects) {
                    projects.splice(0, 0, sharedData.inbox);
                    projects.forEach(function (project){

                        var checked = !!selectAll;
                        for(var  i=0; i < prevProjects.length; i++){

                            if(project.id === prevProjects[i]._id){
                                checked = true;
                                break;
                            }
                        }

                        $scope.projects.push({
                            checked : checked,
                            project : project
                        });

                    });

                }
            });
        };

        $scope.getAssignees = function(prevAssignee, selectAll){

            $scope.assignees = [];

            project.getAllProjectsUsers().then(function(list){
                if(list){

                    list.forEach(function (assignee){

                        var checked = !!selectAll;
                        for(var  i=0; i < prevAssignee.length; i++){

                            if(assignee._id === prevAssignee[i]._id){
                                checked = true;
                                break;
                            }
                        }

                        $scope.assignees.push({
                            checked : checked,
                            assignee : assignee
                        });
                    });
                    $scope.assignees = userModel.meTopOnList($scope.assignees, 'assignee');
                }
            });

        };

        $scope.getPriorities = function(prevPriorities, selectAll){

            $scope.priorities = [];
            for(var key in taskService.priorities){
                var priority = taskService.priorities[key];
                var checked = !!selectAll;
                for(var i=0;i< prevPriorities.length; i++){
                    if(priority.name == prevPriorities[i].name){
                        checked = true;
                        break;
                    }
                }
                $scope.priorities.push({
                    checked : checked,
                    priority : priority
                });
            }
        };

        $scope.getLabels = function(prevLabels, selectAll){

            $scope.labels = [];
            labelService.getAll().then(function(labels){
                if(labels){
                    labels.forEach(function (label){
                        var checked = !!selectAll;
                        for(var  i=0; i < prevLabels.length; i++){
                            if(label.id === prevLabels[i]._id){
                                checked = true;
                                break;
                            }
                        }

                        $scope.labels.push({
                            checked : checked,
                            label : label
                        });

                    });
                }

            });
        };

        $scope.save = function(){

            $scope.form.$submitted = true;
            if ($scope.form.$valid) {
                if(discardChange.isChanged($scope.project)){
                    var user=userModel.getLoggedInUser();
                    roleValidators.checkUserRole(user,dbEnums.USER_ROLES.CUSTOM_FILTERS,{},true)
                        .then(function(){
                            $scope.filter.projects = filterService.setProjects($scope.projects);
                            $scope.filter.assignees = filterService.setAssignees($scope.assignees);
                            $scope.filter.priorities = filterService.setPriorities($scope.priorities);
                            $scope.filter.labels = filterService.setLabels($scope.labels);

                            filterService.addOrUpdate($scope.filter).then(function(results){

                                if(results){
                                    $rootScope.$emit('toast-message', message.successMessages.FILTER_EDITED);
                                    $rootScope.$emit('filterList-update');
                                    discardChange.updateDiscardedBeforeSave();
                                    $state.go('/filter/details',{id:$scope.filter.id});
                                    //sharedData.home();
                                }
                            });

                        });

                }
                else {
                    discardChange.updateDiscardedBeforeSave();
                    $state.go('/filter/details',{id:$scope.filter.id});
                    //sharedData.home();
                }
            }

        };

        $scope.start = function (){

            filterService.findById($stateParams.id).then(function(filter){
                if(filter){

                    $scope.fields = angular.copy(filterService.fields);
                    $scope.dueDates =  filterService.dueDates;
                    $scope.filter = filter;
                    $rootScope.title = $scope.filter.name;

                    $scope.getProjects($scope.filter.projects, $scope.filter.allProjects);
                    $scope.getAssignees($scope.filter.assignees, $scope.filter.allAssignees);
                    $scope.getPriorities($scope.filter.priorities, $scope.filter.allPriorities);
                    $scope.getLabels($scope.filter.labels, $scope.filter.allLabels);
                    $rootScope.$emit('basic:header', $state.current.state, $scope.filter, $scope, true);
                    discardChange.savePrevious($scope, $scope.filter);
                }
                else sharedData.home();

            });

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
