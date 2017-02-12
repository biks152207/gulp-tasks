(function () {

    app.service('filterService', function ($q, $window, $rootScope,labelService, date, filterModel,
                                           dbEnums, message, sync) {

        var self = this;

        self.addOrUpdate = function(filter){
            var defer = $q.defer();

            sync.add(dbEnums.collections.Filter, filter, dbEnums.events.Filter.addOrUpdate);
            filterModel.addOrUpdate(filter, function(err, results){
                defer.resolve(results);
            });

            return defer.promise;
        };

        self.findById = function (id) {
            var defer = $q.defer();
            filterModel.findById(id, function(err, filter){
                defer.resolve(filter);
            });

            return defer.promise;

        };

        self.getAll = function () {
            var defer = $q.defer();

            filterModel.getAll(function(err, list){
                defer.resolve(list)

            });
            return defer.promise;
        };

        self.delete = function(filter){
            var defer = $q.defer();
            sync.add(dbEnums.collections.Filter, filter, dbEnums.events.Filter.delete);
            filterModel.delete(filter.id, function(err, isDeleted){

                defer.resolve(isDeleted);
            });

            return defer.promise;
        };

        self.removeProjectFromAllFilters = function(project){
            filterModel.getAll(function(err, list){
                list.forEach(function(filter){
                    filter.projects.forEach(function(fProject, index){
                        if(fProject._id == project.id){
                            filter.projects.splice(index, 1);
                        }
                    })
                });

                filterModel.bulkUpdate(list, function(){});
            });

        };

        self.updateItem = function(item) {
            if(item.status === dbEnums.status.active){
                filterModel.addOrUpdate(item, function(err, filter){});
            }
            else if(item.status === dbEnums.status.deleted){
                filterModel.delete(item.id, function(err, isDeleted){});
            }
        };

        self.setProjects = function (projects) {
            var selected = [];

            projects.forEach(function (item) {

                if (item.checked) {
                    selected.push({
                        _id: item.project.id,
                        name: item.project.name,
                        color: item.project.color
                    });
                }

            });
            return selected;
        };

        self.setAssignees = function (assignees) {

            var selected = [];

            assignees.forEach(function (item) {

                if (item.checked) {
                    selected.push({
                        _id: item.assignee._id,
                        displayName: item.assignee.displayName,
                        displayShortName: item.assignee.displayShortName,
                        email: item.assignee.email,
                        avatar: item.assignee.avatar
                    });
                }

            });
            return selected;

        };

        self.setPriorities = function (priorities) {

            var selected = [];

            priorities.forEach(function (item) {

                if (item.checked) {
                    selected.push({
                        name: item.priority.name,
                        number: item.priority.number,
                        color: item.priority.color
                    });
                }

            });
            return selected;

        };

        self.setLabels = function (labels) {

            var selected = [];

            labels.forEach(function (item) {

                if (item.checked) {
                    selected.push({
                        _id: item.label.id,
                        name: item.label.name,
                        color: item.label.color
                    });
                }

            });
            return selected;

        };


        function filterByProjects(task, projects) {

            for (var j = 0; j < projects.length; j++) {

                if (task.project.id === projects[j]._id) return true;

            }
            return false;
        }

        function filterByAssignees(task, assignees) {

            var assignee = null;
            for (var i = 0; i < task.users.length; i++) {
                if ((task.users[i].role === dbEnums.taskUserRole.assignee && task.users[i]._id) || (task.project.id==0 && task.users[i].role==dbEnums.taskUserRole.admin)){
                     assignee = task.users[i];
                    break;
                }
            }

            for (var j = 0; j < assignees.length; j++) {

                if (assignee) {
                    if (assignee._id === assignees[j]._id) return true;
                }
            }

            return false;
        }

        function filterByPriorities(task, priorities) {

           for (var j = 0; j < priorities.length; j++) {

                if (task.priority === priorities[j].number) {
                   return true;
               }
            }
            return false;
        }

        function filterByLabels(task, labels) {
            var isExists = false;
            labels.forEach(function(object){

              labelService.findById(object._id).then(function(label){
                    if(label && labelService.isTaskExists(task, label)){
                        isExists = true;
                    }

              });
           });

            return isExists;
        }

        function filterByDueDate(task, dueDate) {

            var isInDate = false;
            switch (dueDate) {

                case  self.dueDates[0]:
                    if (!task.recurrence.due_date) isInDate = true;
                    break;

                case  self.dueDates[1]:
                    if (date.isPastDay(task.recurrence.due_date)) isInDate = true;
                    break;

                case  self.dueDates[2]:
                    if (date.isToday(task.recurrence.due_date)) isInDate = true;
                    break;

                case  self.dueDates[3]:
                    if (date.isTomorrow(task.recurrence.due_date)) isInDate = true;
                    break;

                case  self.dueDates[4]:
                    if (date.isInNextNDays(task.recurrence.due_date, 2)) isInDate = true;
                    break;

                case  self.dueDates[5]:
                    if (date.isInNextNDays(task.recurrence.due_date, 3)) isInDate = true;
                    break;

                case  self.dueDates[6]:
                    if (date.isInNextNDays(task.recurrence.due_date, 5)) isInDate = true;
                    break;

                case  self.dueDates[7]:
                    if (date.isInNextNDays(task.recurrence.due_date, 7)) isInDate = true;
                    break;

                case  self.dueDates[8]:
                    if (date.isInNextNDays(task.recurrence.due_date, 14)) isInDate = true;
                    break;

                case  self.dueDates[9]:
                    if (date.isInNextNMonths(task.recurrence.due_date, 1)) isInDate = true;
                    break;

                case  self.dueDates[10]:
                    if (date.isInNextNMonths(task.recurrence.due_date, 6)) isInDate = true;
                    break;

                case  self.dueDates[11]:
                    if (date.isInNextNYears(task.recurrence.due_date, 1)) isInDate = true;
                    break;


            }

            return isInDate;
        }

        self.isTaskExists = function(task, filter){

            //return  filter.allProjects ||
            //        filter.allAssignees ||
            //        filter.allPriorities ||
            //        filter.allLabels ||
            //        filterByProjects(task, filter.projects) ||
            //        filterByAssignees(task, filter.assignees) ||
            //        filterByPriorities(task, filter.priorities) ||
            //        filterByLabels(task, filter.labels) ||
            //        filterByDueDate(task, filter.due_date);
            var projectCheck= checkForProject(task,filter);
            var assigneeCheck=checkForAssignee(task,filter);
            var priorityCheck=checkForPriorities(task,filter);
            var labelCheck=checkForLabels(task,filter);
            var dueDateCheck=checkForDueDate(task,filter);

            return projectCheck && assigneeCheck && priorityCheck && labelCheck && dueDateCheck;
        };

        function checkForProject(task,filter){
            return filter.allProjects || (!filter.allProjects && filter.projects.length==0) || filterByProjects(task,filter.projects);
        }

        function checkForAssignee(task,filter){
            return filter.allAssignees || (!filter.allAssignees && filter.assignees.length==0) ||filterByAssignees(task,filter.assignees);

        }

        function checkForPriorities(task,filter){
            return filter.allPriorities || (!filter.allPriorities && filter.priorities.length==0) || filterByPriorities(task,filter.priorities);
        }

        function checkForLabels(task,filter){
            return filter.allLabels || (!filter.allLabels && filter.labels.length==0) || filterByLabels(task,filter.labels);

        }

        function checkForDueDate(task,filter){
            return !filter.due_date || filterByDueDate(task,filter.due_date);
        }

        self.fields = [{
            project: false,
            people: false,
            priority: false,
            label: false,
            dueDate: false
        }];

        self.dueDates = [
            'No date',
            'Overdue',
            'Today',
            'Tomorrow',
            'Within 2 days',
            'Within 3 days',
            'Within 5 days',
            'Within 1 week',
            'Within 2 weeks',
            'Within 1 month',
            'Within 6 months',
            'Within 1 year'

        ];

    });

}).call(this);
