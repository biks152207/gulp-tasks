(function () {
    app.service('project', function ($http, $rootScope, $q, $state, RESPONSE_CODE, connectivity, message,
                                     API, sharedData, dbEnums, guidGenerator,  projectModel, sync, userModel,
                                    filterService, taskService,userRoleValidator,roleValidators) {

        var self = this;

        self.addOrUpdate = function(project, update){
            var defer = $q.defer();
            var user=userModel.getLoggedInUser();
            //var asyncTask= $q(function(resolve,reject){
            //    resolve();
            //});
            //
            //if(!update){
            //    asyncTask=asyncTask.then(function(){
            //
            //        return roleValidators.checkUserRole(user,dbEnums.USER_ROLES.ACTIVE_PROJECTS,{project:project,user:user},true);
            //
            //    });
            //}
            //asyncTask.then(function(){
                sync.add(dbEnums.collections.Project,{
                    project: project,
                    update: update
                } , dbEnums.events.Project.addOrUpdate);
                projectModel.addOrUpdate(project, function(err, results){
                    //if(!update){
                    //    roleValidators.applyFeatureOnProjects(user,[project],function(){
                    //        defer.resolve(results);
                    //    });
                    //}
                    //else{
                        defer.resolve(results);
                    //}

                });
            //},function(err){
            //    console.log('license validation rejected with ');
            //    console.log(err);
            //});



            return defer.promise;
        };

        self.archive = function (project) {

            project.users.forEach(function(user){
                if(user._id === userModel.getLoggedInId()){
                    user.status = dbEnums.status.archived;
                }
            });

            var defer = $q.defer();

            sync.add(dbEnums.collections.Project,{
                userId:userModel.getLoggedInId(),
                project: project

            } ,dbEnums.events.Project.archive);

            projectModel.addOrUpdate(project, function(err, results){
                defer.resolve(results);
            });
            return defer.promise;
        };

        self.delete = function(project){
            var defer = $q.defer();
            project.updatedBy = userModel.getLoggedInUser();
            sync.add(dbEnums.collections.Project, project, dbEnums.events.Project.delete);

            projectModel.delete(project.id, function(err, results){
                filterService.removeProjectFromAllFilters(project);
                taskService.removeTasksByProjectId(project);
                defer.resolve();
            });

            return defer.promise;
        };

        self.deleteUser = function (project, deletedUser) {

            project.users.forEach(function(user, index, object){
                if(user.email === deletedUser.email){
                   object.splice(index, 1);
                }
            });

            var defer = $q.defer();

            sync.add(dbEnums.collections.Project,{
                deletedUser: deletedUser,
                projectId: project.id

            }, dbEnums.events.Project.deleteUser);

            projectModel.addOrUpdate(project, function(err, results){
                defer.resolve(results);
            });
            return defer.promise;
        };

        self.findById = function (id) {
            var defer = $q.defer();
            projectModel.findById(id, function(err, project){
                defer.resolve(project);
            });

            return defer.promise;
        };

        self.getAll = function () {
            var defer = $q.defer();

            projectModel.getAll(function(err, list){
                defer.resolve(list)

            });
            return defer.promise;
        };

        self.getAllArchived = function () {
            var defer = $q.defer();

            projectModel.getAllArchived(function(err, list){
                defer.resolve(list)

            });
            return defer.promise;
        };

        self.getAllProjectsUsers = function(){
            var users = [];
            var exists = [];
            var defer = $q.defer();
            projectModel.getAll(function(err, list){
                list.forEach(function(project){
                    for(var i=0;i< project.users.length; i++){
                        var tmpUser = project.users[i];
                        if(!exists[tmpUser._id]){
                            users.push(tmpUser);
                            exists[tmpUser._id] = true;
                        }
                    }
                });
                defer.resolve(users);
            });
            return defer.promise;
        };

        self.getUserFromAllProjects = function(id){
            var defer = $q.defer();
            self.getAllProjectsUsers().then(function(allUsers){
                var assignee = null;
                for(var i=0;i<allUsers.length; i++){
                   if(allUsers[i]._id == id) {
                       assignee = allUsers[i];
                       break;
                   }
               }
                defer.resolve(assignee);
            });
            return defer.promise;
        };

        self.getProjectUserById = function(project, id){
            for (var i=0;i< project.users.length; i++){
                if(project.users[i]._id === id) return project.users[i];
            }
        };

        self.getProjectAdmin = function(project){
            for (var i=0;i< project.users.length; i++){
                if(project.users[i].isAdmin) return project.users[i];
            }
        };

        self.getUserRole = function(project, id){
            for (var i=0;i< project.users.length; i++){
                if(project.users[i]._id === id) return project.users[i].role;
            }
        };

        self.left = function(project){
            var defer = $q.defer();

            sync.add(dbEnums.collections.Project,{
                userId: userModel.getLoggedInId(),
                project: project

            } ,dbEnums.events.Project.left);

            projectModel.delete(project.id, function(err, results){
                filterService.removeProjectFromAllFilters(project);
                taskService.removeTasksByProjectId(project);
                defer.resolve();
            });

            return defer.promise;
        };

        self.reorder = function(projects,cb){

            projects.forEach(function(project, index){
                project.users.forEach(function(user){
                    if(user._id ==userModel.getLoggedInId() && user.status === dbEnums.status.active){
                        user.order = index;
                    }
                });
            });
            sync.add(dbEnums.collections.Project,{
                projects: projects,
                userId:userModel.getLoggedInId()
            } , dbEnums.events.Project.reorder);
            projectModel.bulkUpdate(projects,true, cb);

        };

        self.reSendInvitation = function (data) {

            var defer = $q.defer();

            if(connectivity.isConnected()){

                $http.post(API.project.reSendInvitation, data)
                    .success(function (results) {

                        if (results.response_code === RESPONSE_CODE.SUCCESS) {
                            defer.resolve({
                                error: false,
                                message: message.successMessages.PROJECT_INVITATION_RESENT
                            });
                        } else if (results.response_code === RESPONSE_CODE.ERROR) {

                            defer.resolve({
                                error: true,
                                message: message.errorMessages[results.errors.value]
                            });
                        }

                    })
                    .error(function () {
                        defer.resolve({
                            error: true,
                            message: message.errorMessages.CONNECTION_ERROR
                        });

                    });
            }
            else {
                defer.resolve({
                    error: true,
                    message: message.errorMessages.CONNECTION_ERROR
                });
            }
            return defer.promise;
        };

        self.sendInvitation = function (project, invitedUser) {

            var defer = $q.defer();
            //var user=userModel.getLoggedInUser();
            //
            //roleValidators.checkUserRole(user,dbEnums.USER_ROLES.MAX_USERS_PROJECT,{project:project,invitedUser:invitedUser},true)
            //    .then(function() {
                    delete invitedUser.accessToken;
                    delete invitedUser.accessTokenExpired;
                    delete invitedUser.approvalToken;
                    project.users.push(invitedUser);

                    sync.add(dbEnums.collections.Project,
                        {
                            projectId: project.id,
                            invitedUser: invitedUser
                        }, dbEnums.events.Project.sendInvitation);

                    projectModel.addOrUpdate(project, function (err, results) {
                        defer.resolve(results);
                    });
                //},defer.reject);

            return defer.promise;
        };

        self.unArchive = function (project) {

            project.users.forEach(function(user){
                if(user._id ===userModel.getLoggedInId()){
                    user.status = dbEnums.status.active;
                }
            });

            var defer = $q.defer();

            sync.add(dbEnums.collections.Project,{
                userId: userModel.getLoggedInId(),
                project: project

            } ,dbEnums.events.Project.unArchive);

            projectModel.addOrUpdate(project, function(err, results){
                defer.resolve(results);
            });
            return defer.promise;
        };

        self.updateItem = function(item) {

            if(item.status === dbEnums.status.deleted){
                projectModel.delete(item.id, function(err, isDeleted){});
            }
            else projectModel.addOrUpdate(item, function(err, project){});
        };

        self.canDeleteProject=function(project){

            var user=userModel.getLoggedInUser();
            if(!project || !user){
                return false;
            }
            var projUser= _.find(project.users,function(projUser){
                if(projUser._id && projUser._id==user._id){
                    return true;
                }
            });
            if(projUser){
                return projUser.role==dbEnums.projectUserRole.admin && project.users.length<=1;

            }
            else{
                return false;
            }
        };

        self.canDeleteUser=function(project,user){
            if(!user || !project || project.users.length<=0){
                return false;
            }
            var projUser= _.find(project.users,function(projUser){
                if(projUser._id && projUser._id==user._id){
                    return true;
                }
            });
            if(projUser){
                return projUser.role==dbEnums.projectUserRole.admin;
            }
            else{
                return false;
            }
        }

    });

}).call(this);