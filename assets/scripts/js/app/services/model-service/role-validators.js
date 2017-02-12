/**
 * Created by skyestreamptyltd on 7/5/16.
 */
(function(){
    app.service("roleValidators",['$q','projectModel','popupService','CONSTANT','dbEnums','userModel','taskModel',
        'labelModel','helperService','$window','connectivity','userModelHelper',function($q,projectModel,popupService,CONSTANT,dbEnums,userModel,taskModel,labelModel,helperService,$window,connectivity,userModelHelper){
        var self=this;
        self.checkUserRole=function(user,featureKeyColl,data,showWarning){
            return $q(function(resolve,reject){
                //resolve();
                //return;
                if(typeof featureKeyColl=='string'){
                    featureKeyColl=[featureKeyColl];
                }


                var allAsyncTaskColl=$q(function(resolve,reject){
                   resolve();
                });
                _.each(featureKeyColl,function(featureKey){
                    allAsyncTaskColl=allAsyncTaskColl.then(function(){
                        return $q(function(resolve,reject){
                            var theValidators= _.filter(validators,function(validator){
                                return validator.key==featureKey;
                            });
                            console.log('this is a validators');
                            console.log('validator', theValidators);

                            var asyncTasks=$q(function(resolve,reject){
                                resolve();
                            });

                            _.each(theValidators,function(validator) {
                                asyncTasks = asyncTasks.then(function () {

                                    return validator.validate(user, featureKey, data);

                                });
                            });

                            asyncTasks.then(resolve,reject);
                        });
                    });


                });

                allAsyncTaskColl.then(resolve,reject);

            })
            .then(null,function(err){
                return $q(function(resolve,reject){
                    if(err && err.key && err.key=='LICENSE'){
                        if(showWarning){
                            popupService.roleWarning(null,err)
                                .then(function(){
                                    if(window.cordova){
                                        $window
                                            .open(
                                            encodeURI(CONSTANT.upgradeUrl), '_system', 'location=no');
                                    }
                                    else{
                                        $window.open(
                                            CONSTANT.upgradeUrl,
                                            '_blank'
                                        );
                                    }

                                    console.log('UPGRADE code goes here');

                                },function(){
                                    console.log('UPGRADE CANCEL code goes here')
                                });
                        }

                    }
                    reject(err);

                });

            });
        };


        var validators=[
            {
                "key": "active_projects",
                "validate": function (user,featureKey, data) {
                    var defer = $q.defer();
                    //var user=data.user;
                    var userFeatures = userModel.getUserFeatures();
                    var userFeature;
                    var asyncChain=$q(function(resolve,reject){
                        resolve();
                    });
                    asyncChain=asyncChain.then(function(){
                        return checkUserFeature(userFeatures,featureKey);
                    })
                    .then(function(feature){
                        userFeature=feature;
                        return $q(function(resolve,reject){
                            projectModel.getUserCreatedActiveProjects(user._id,function (err,projects) {
                                if(err) reject(err);
                                else {
                                    if (feature.config.max!=="*" && (projects.length+1) > feature.config.max) {
                                        reject(getRejectionMessage(user,feature,dbEnums.USER_ROLES.ACTIVE_PROJECTS));

                                    }
                                    else {
                                        resolve();
                                    }
                                }


                            });
                        });

                    })
                    .then(defer.resolve,defer.reject);


                    return defer.promise;
                }
            },
            {
                "key":"active_tasks",
                "validate":function(user,featureKey,data){
                    return $q(function(resolve,reject){

                        var task=data.task;
                        var project=data.project||(task?task.project:null);
                        var asyncTask=$q(function(resolve,reject){
                            if(!task){
                                resolve();
                            }
                            else{
                                onlyIfProjectChanged(task).then(resolve,reject);
                            }
                        });
                        asyncTask.then(function(){
                            return $q(function(resolve,reject){
                                getProjectConfigForKey(project,dbEnums.USER_ROLES.ACTIVE_TASKS)
                                    .then(function(result){
                                        return $q(function(resolve,reject){
                                            var project=result.project,config=result.config;
                                            if(config.max!=="*" ){
                                                return getProjectTasks(project)
                                                    .then(function(projectTasks){
                                                        if((projectTasks.length+1)>config.max){
                                                            var isProjectAdmin=isUserProjectAdmin(user,project);
                                                            var projectAdmin=helperService.getUserByRole(project.users,dbEnums.projectUserRole.admin);

                                                            reject(getRejectionMessage(projectAdmin,config,dbEnums.USER_ROLES.ACTIVE_TASKS,!isProjectAdmin));
                                                        }
                                                        else{
                                                            resolve();
                                                        }
                                                    },reject);
                                            }
                                            else{
                                                resolve();
                                            }
                                        });
                                    })
                                    .then(resolve,reject);
                            });

                        })
                        .then(resolve,function(err,result){
                           if(err && err.shouldSkip){
                               resolve(result);

                           }
                            else{
                               rejectProjectError(err,user,project)
                                   .then(reject);
                           }

                        });


                    });
                }

            }
            ,{
                "key":"assignee_project",
                "validate":function(user,featureKey,data){
                    return $q(function(resolve,reject){

                        var task=data.task;
                        var project=task.project;
                        hasAddedAssigneeToTask(user,task)
                            .then(function(){
                                return skipSelfAssigning(user,task)
                                    .then(function(){
                                        getProjectConfigForKey(project,dbEnums.USER_ROLES.ASSIGNEE_PROJECT)
                                            .then(function(result){
                                                return $q(function(resolve,reject){
                                                    var project=result.project,config=result.config;
                                                    if(config.max!=="*" ){
                                                        return getProjectTasks(project)
                                                            .then(function(projectTasks){
                                                                //Get other assigned tasks.
                                                                var assignedTasks= _.filter(projectTasks,function(projectTask){
                                                                    if(projectTask.id==task.id){
                                                                        return false;
                                                                    }
                                                                    else{
                                                                        var assignee=taskModel.getTaskUserByRole(projectTask,dbEnums.taskUserRole.assignee);
                                                                        return projectTask.status==dbEnums.status.active && assignee && assignee._id!=user._id;
                                                                    }

                                                                });

                                                                if((assignedTasks.length+1)>config.max){
                                                                    var isProjectAdmin=isUserProjectAdmin(user,project);
                                                                    var projectAdmin=helperService.getUserByRole(project.users,dbEnums.projectUserRole.admin);
                                                                    reject(getRejectionMessage(projectAdmin,config,dbEnums.USER_ROLES.ASSIGNEE_PROJECT,!isProjectAdmin));
                                                                }
                                                                else{
                                                                    resolve();
                                                                }
                                                            },reject);
                                                    }
                                                    else{
                                                        resolve();
                                                    }
                                                });
                                            })
                                            .then(function(result){
                                                resolve(result);
                                            },function(err){
                                                rejectProjectError(err,user,project)
                                                    .then(reject);
                                            });
                                    });

                            },null)
                            .then(null,function(err){
                                if(err && err.shouldSkip){
                                    resolve();
                                }
                                else{
                                    reject(err);
                                }
                            });


                    });
                }

            }
            ,{
                "key":"max_users_project",
                "validate":function(user,featureKey,data){
                    return $q(function(resolve,reject){

                        var project=typeof data.project=='object'?data.project:{id:data.project};
                        var invitedUser=data.invitedUser;
                        var invitedBy=invitedUser?invitedUser.invitedBy:user;

                        getProjectConfigForKey(project,dbEnums.USER_ROLES.MAX_USERS_PROJECT)
                            .then(function(result){
                                return $q(function(resolve,reject){
                                    var project=result.project,config=result.config;
                                    if(config.max!=="*" ){
                                        var totalUsers=project.users.length;


                                        if((totalUsers+1)>config.max){
                                            var isProjectAdmin=isUserProjectAdmin(user,project);
                                            var projectAdmin=helperService.getUserByRole(project.users,dbEnums.projectUserRole.admin);

                                            reject(getRejectionMessage(projectAdmin,config,dbEnums.USER_ROLES.MAX_USERS_PROJECT,!isProjectAdmin));
                                        }
                                        else{
                                            resolve();
                                        }

                                    }
                                    else{
                                        resolve();
                                    }
                                });
                            })
                            .then(function(result){
                                resolve(result);
                            },function(err){
                                rejectProjectError(err,user,project)
                                    .then(reject);
                            });

                    });
                }

            }
            ,{
                "key": "labels",
                "validate": function (user,featureKey, data) {
                    var defer = $q.defer();
                    //var user=data.user;
                    var userFeatures = userModel.getUserFeatures();
                    var label = data.label;
                    var userFeature;
                    var asyncChain = $q(function (resolve, reject) {
                        resolve();
                    });
                    asyncChain = asyncChain.then(function () {
                        return checkUserFeature(userFeatures, featureKey);
                    })
                        .then(function (feature) {
                            userFeature = feature;
                            return $q(function (resolve, reject) {
                                if (feature.config.max !== '*') {
                                    labelModel.getAll(function (err, labels) {
                                        if (err) reject(err);
                                        else {
                                            var existingLabel =!label?null: _.find(labels, function (lbl) {
                                                return lbl.id == label.id;
                                            });
                                            if (existingLabel) {
                                                reject(getRejectionMessage(user, feature.config, dbEnums.USER_ROLES.LABELS, false));
                                            }
                                            else {
                                                if ((labels.length + 1) > feature.config.max) {
                                                    reject(getRejectionMessage(user, feature.config, dbEnums.USER_ROLES.LABELS, false));
                                                }
                                                else {
                                                    resolve();
                                                }
                                            }
                                        }

                                    });
                                }
                                else {
                                    resolve();
                                }

                            });

                        })
                        .then(defer.resolve, defer.reject);


                    return defer.promise;
                }
            }
            ,{
                "key": "labels_assign",
                "validate": function (user,featureKey, data) {
                    var defer = $q.defer();

                    var labels=data.labels || [];
                    var task=data.task;

                    var userFeatures = userModel.getUserFeatures();

                    var checkedLabels= _.filter(labels,function(lblWrapped){
                       return lblWrapped.checked;
                    });
                    var onlyLabels= _.map(checkedLabels,function(lblWrapped){
                       return lblWrapped.label;
                    });

                    var userFeature;
                    var asyncChain = $q(function (resolve, reject) {
                        resolve();
                    });
                    asyncChain=asyncChain.then(function(){
                       return anyNewLabelOnTask(onlyLabels,task.id);
                    });

                    asyncChain = asyncChain.then(function (result) {
                        if(result){
                            return checkUserFeature(userFeatures, featureKey);
                        }
                        else{
                            return $q(function(resolve,reject){
                               reject({shouldSkip:true});
                            });
                        }

                    })

                    .then(defer.resolve,function(err){
                            if(err && err.shouldSkip){
                                defer.resolve();
                            }
                            else{
                                defer.reject(err);
                            }
                        });


                    return defer.promise;
                }
            }
            ,{
                "key": "email_notifications",
                "validate": function (user,featureKey, data) {
                    var defer = $q.defer();


                    var userFeatures = userModel.getUserFeatures();

                    var userFeature;
                    var asyncChain = $q(function (resolve, reject) {
                        resolve();
                    });

                    asyncChain = asyncChain.then(function (result) {

                            return checkUserFeature(userFeatures, featureKey);

                    })
                    .then(defer.resolve,function(err){
                        if(err && err.shouldSkip){
                            defer.resolve();
                        }
                        else{
                            defer.reject(err);
                        }
                    });


                    return defer.promise;
                }
            }
            ,{
                "key": "custom_filters",
                "validate": function (user,featureKey, data) {
                    return featureExists(user,featureKey,data);
                }
            }
            ,{
                "key": "search",
                "validate": function (user,featureKey, data) {
                    return featureExists(user,featureKey,data);
                }
            }
            ,{
                "key": "file_upload",
                "validate": function (user,featureKey, data) {
                    return featureExists(user,featureKey,data);
                }
            }
            , {
                "key": "file_upload_size",
                "validate": function (user,featureKey, data) {
                    var defer = $q.defer();
                    //var user=data.user;
                    var theFile=data.file;
                    var userFeatures = userModel.getUserFeatures();
                    console.log('file upload user features', userFeature);
                    var userFeature;
                    var asyncChain=$q(function(resolve,reject){
                        resolve();
                    });
                    asyncChain=asyncChain.then(function(){
                        return checkUserFeature(userFeatures,featureKey);
                    })
                        .then(function(feature){
                            userFeature=feature;
                            console.log('top top', feature);
                            return $q(function(resolve,reject){
                                if(feature.config.max!=="*" ){
                                    var fileLengthInMb=(theFile.size/1024)/1024
                                    console.log('file length...........sfsdfsdfsdf');
                                    console.log(fileLengthInMb);

                                    if((fileLengthInMb)>feature.config.max){
                                        reject(getRejectionMessage(user,feature.config,featureKey,false));

                                    }
                                    else{
                                        resolve();
                                    }

                                }
                                else
                                {
                                    resolve();
                                }
                            });

                        })
                        .then(defer.resolve,defer.reject);


                    return defer.promise;
                }
            }
            , {
                "key": "file_storage_max",
                "validate": function (user,featureKey, data) {
                    var defer = $q.defer();
                    //var user=data.user;
                    var theFile=data.file;
                    var userFeatures = userModel.getUserFeatures();
                    var userFeature;
                    var asyncChain=$q(function(resolve,reject){
                        resolve();
                    });

                    asyncChain=asyncChain.then(function(){
                        return $q(function(resolve,reject){
                            userFeature=userFeatures[featureKey];
                            if(!userFeature){
                                resolve();
                            }
                            else{
                                userModelHelper.getLoggedInUserTotalStorage()
                                    .then(function(userTotalStorage){
                                        if(userFeature.config.max!=="*" ){
                                            var total=userTotalStorage+theFile.size;

                                            var fileLengthInMb=(total/1024)/1024

                                            if((fileLengthInMb)>userFeature.config.max){
                                                reject(getRejectionMessage(user,userFeature.config,featureKey,false));

                                            }
                                            else{
                                                resolve();
                                            }

                                        }
                                        else
                                        {
                                            resolve();
                                        }

                                    },reject);


                            }

                        });
                    })
                    .then(defer.resolve,defer.reject);


                    return defer.promise;
                }
            }
            ,{
                "key": "my_feeds",
                "validate": function (user,featureKey, data) {
                    return featureExists(user,featureKey,data);
                }
            }
            ,{
                "key": "task_history",
                "validate": function (user,featureKey, data) {
                    return featureExists(user,featureKey,data);
                }
            }

        ];

            function skipSelfAssigning(user,task){
                return $q(function(resolve,reject){
                    var assignee=taskModel.getTaskUserByRole(task,dbEnums.taskUserRole.assignee);
                    if(!assignee){
                        resolve();
                    }
                    else{
                        if(user._id==assignee._id){
                            reject({shouldSkip:true});
                        }
                        else{
                            resolve();
                        }
                    }

                });

            }

            function checkInternetConnection(){
                return $q(function(resolve,reject){
                    if(connectivity.isConnected()) {
                        reject({
                            error: true,
                            msg: message.errorMessages.CONNECTION_REQUIRED
                        });
                    }
                    else{
                        resolve();
                    }

                });
            }

            function featureExists(user,featureKey,data){
                var defer = $q.defer();


                var userFeatures = userModel.getUserFeatures();

                var userFeature;

                var asyncChain = $q(function (resolve, reject) {
                    resolve();
                });

                asyncChain = asyncChain.then(function (result) {
                    return checkUserFeature(userFeatures, featureKey);

                })
                .then(defer.resolve,function(err){
                    if(err && err.shouldSkip){
                        defer.resolve();
                    }
                    else{
                        defer.reject(err);
                    }
                });


                return defer.promise;
            }

            function onlyIfProjectChanged(task){
                return $q(function(resolve,reject){
                    hasProjectChangedOrNew(task)
                       .then(function(result){
                           if(!result){
                               reject({shouldSkip:true});
                           }
                           else{
                               resolve();
                           }
                       },reject);
                });
            }
            function hasProjectChangedOrNew(task){
                return $q(function(resolve,reject){
                   taskModel.findById(task.id,function(err,existingTask){
                      if(err) reject(err);
                       else{
                          if(existingTask){
                              var hasProjectChanged=existingTask.project.id!=task.project.id;
                              resolve(hasProjectChanged);
                          }
                          else{
                              resolve(true);
                          }
                      }
                   });

                });
            }

            function anyNewLabelOnTask(labels,taskId){
                return $q(function(resolve,reject){
                    labelModel.getAll(function(err,userLabels){
                        if(err) reject(err);
                        else{
                            var taskLabels= _.filter(userLabels,function(usrLabel){
                                return (usrLabel.tasks||[]).indexOf(taskId)>=0;
                            });

                            var taskLabelIds= _.map(taskLabels,function(tLabel){
                                return tLabel.id;
                            });
                            var labelIds= _.map(labels||[],function(lbl){
                                return lbl.id;
                            });

                            var anyNewLabel=false;
                            _.each(labelIds,function(lblId){
                                var labelExist= _.indexOf(taskLabelIds,lblId)>=0;
                                if(!labelExist){
                                    anyNewLabel=true;
                                    return false;
                                }
                            });
                            resolve(anyNewLabel);
                        }
                    });
                });
            }


            function hasAddedAssigneeToTask(user,task){
            return $q(function(resolve,reject){
                var assignee=helperService.getUserByRole(task.users,dbEnums.taskUserRole.assignee);
                if(!assignee){
                    //No assignee added
                    reject({shouldSkip:true});
                }
                else{
                    // assignee added, so let's find old task and see there was any assignee previously
                    taskModel.findById(task.id,function(err,oldTask){
                        if(err) reject(err);
                        else{
                            if(!oldTask) {

                                //new task, so probably added a new assignee

                                resolve();
                            }
                            else {
                                var oldAssignee=taskModel.getTaskUserByRole(oldTask,dbEnums.taskUserRole.assignee);
                                if(!oldAssignee){
                                    // yes user has added a new assignee to the task;

                                    resolve();
                                }
                                else{
                                    //So there was assignee in old task. No new assignee added to the project as a whole.
                                    //But let's check if the project has changed, which means new assignee added to a different project.
                                    if(oldTask.project.id!=task.project.id){
                                        //But project has changed.
                                        resolve();
                                    }
                                    else{
                                        if(oldAssignee._id!=assignee._id){
                                            if(assignee._id!=user._id){
                                                resolve();
                                            }
                                            else{
                                                //So basically no additional user has been assigned to the project.
                                                reject({shouldSkip:true});
                                            }
                                        }
                                        else{
                                            reject({shouldSkip:true});
                                        }


                                    }

                                }
                            }
                        }

                    });
                }

            });
        }

        function rejectProjectError(result,user,project){
            return $q(function(resolve,reject){
                if(result && result.key=="LICENSE" && result.isLicense){
                    if(project.id==0){
                        result.skipUpgrade=true;
                        resolve(result);
                    }
                    else{
                        projectModel.findById(project.id,function(err,project){

                            var isAdmin=isUserProjectAdmin(user,project);
                            result.skipUpgrade=!isAdmin;
                            resolve(result);
                        });
                    }
                    //err.shouldUpgradeLicense=project.id==0||(err.project && isUserProjectAdmin(user,err.project);
                }
                else{
                    resolve(err);
                }
            });
        }



        function isUserProjectAdmin(user,project){
            var isAdmin= project.id==0;
            if(!isAdmin){
                var projectAdmin= _.find(project.users,function(projUser){
                    return projUser.isAdmin;
                });
                return projectAdmin?projectAdmin._id==user._id:true;
            }
            else{
                return true;
            }


        }
        function getProjectConfigForKey(project,key){
            var userFeatures = userModel.getUserFeatures();
            return $q(function(resolve,reject){
               if(project.id==0){

                   checkUserFeature(userFeatures,key)
                       .then(function(config){
                           resolve({project:project,config:config});
                       },reject);
               }
                else {
                   projectModel.findById(project.id, function (err, project) {
                       if (err) reject(err);
                       else {
                           var user=userModel.getLoggedInUser();
                           var isProjectAdmin=isUserProjectAdmin(user,project);
                           var featureConfigs=getConfigs(userFeatures);
                           return checkUserFeature(isProjectAdmin?featureConfigs:project.licenseConfigs, key)
                               .then(function (config) {
                                   resolve({project:project,config:config});
                               }, reject);

                       }
                   });
               }
            });
        }

        function getConfigs(features){
            var mapped={};
            _.each(features,function(feature,ky){
                mapped[ky]=feature.config;
            });
            return mapped;

        }
        function getRejectionMessage(user,featureConfig,featureKey,forOther){
            var allLicenseFeatures=userModel.getAllFeatures();
            var feature=allLicenseFeatures[featureKey];
            var message=forOther?feature.message_other: feature.message;
            message=message||'';
            var tokens=getTokens(user);
            message=replaceWithTokens(tokens,message);
            return {
                "key": "LICENSE",
                "message": message,
                "name": feature.name,
                "feature_key":featureKey,
                "isLicense": true,
                "skipUpgrade":feature.skipUpgrade
            }
        }

        function replaceWithTokens(tokens,str){
            _.each(tokens,function(tokenValue,tokenKey){
               str=str.replace('{'+tokenKey+'}',tokenValue);
            });
            return str;
        }

        function getTokens(user){
            return {
                "firstName":user.firstName,
                "lastName":user.lastName,
                "email":user.email,
                "displayName":user.displayName
            }
        }

        function checkUserFeature(userFeatures,featureKey){
            var defer=$q.defer();
            var userFeature=userFeatures[featureKey];
            console.log('previous one', userFeature);
            if(!userFeature) {
                var allLicenseFeatures = userModel.getAllFeatures();

                var licenseFeature = allLicenseFeatures[featureKey];
                console.log('********')
                console.log(licenseFeature);
                var rejectionMessage={
                    "key": "LICENSE",
                    "message": licenseFeature.message,
                    "name": licenseFeature.name,
                    "feature_key":featureKey,
                    "isLicense": true
                };
                console.log('last one...', rejectionMessage);
                //defer.reject({result: false, type: 'LICENSE', reasons: [{key: 'license', value: {name:licenseFeature.name,message:licenseFeature.message}}]});
                defer.reject(rejectionMessage);
            }
            else{
                defer.resolve(userFeature);
            }

            return defer.promise;
        }


        function getUserProjects(user,projects){
            var projs= _.filter(projects,function(proj){
                var isOk=false;
                _.each(proj.users,function(usr){
                    if(usr._id==user._id && usr.isAdmin){
                        isOk=true;
                    }
                });
                return isOk;
            });
            return projs;
        }

        function getProjectTasks(project){
            return $q(function(resolve,reject){
               taskModel.getAll(function(err,tasks){
                   if(err) reject(err);
                   else{
                       var projectTasks= _.filter(tasks,function(task){
                          return project && task.project.id == project.id && task.status == dbEnums.status.active;
                       });
                       resolve(projectTasks);
                   }
               });

            });
        }


        self.validate=function (user,validationKey,feature,data,callback){
            var theValidators= _.filter(validators,function(validator){
                return validator.key==validationKey;
            });

            var validationResults=[];

            var asyncTask=$q(function(resolve,reject){
                resolve();
            });

            _.each(theValidators,function(validator){

                asyncTask=asyncTask.then(function(){
                    var defer=$q.defer();
                    validator.validate(user,feature,data)
                        .then(function() {
                            defer.resolve();
                        },function(err){

                            if(err.isValidation){
                                //validationResults.push({result:false,type:'validation',validationResult:err});
                                defer.reject({result:false,type:'validation',validationResult:err});
                            }
                            else{
                                defer.reject(err);
                            }

                        });
                    return defer.promise;

                });

            });

            asyncTask.then(function(){
                callback();

            },function(err) {
                callback(err);
            });

        };

        self.applyFeatureOnProjects=function(user,projects,callback) {
            var licensesToSend = ["active_tasks", "assignee_project", "users_project"];
            var licenses = userModel.getUserFeatures();

            _.each(projects,function(project){
                project.licenseConfigs = {};
                _.each(licensesToSend, function (licenseToSend) {

                    var license = licenses[licenseToSend];
                    if (license) {
                        project.licenseConfigs[licenseToSend] = license.config;
                    }

                });
            });
            callback();


        };



    }]);
})();