(function(){app.controller("addProjectController",["$rootScope","$state","$scope","$ionicModal","userModel","discardChange","project","guidGenerator","dbEnums","sharedData","message","$q","roleValidators",function(e,t,o,a,r,s,n,c,d,i,l,m,g){o.openModal=function(){o.modal.show()},o.selectColor=function(e){o.project.color=e},o.saveKeyEnter=function(e){13==e.keyCode&&o.save()},o.save=function(){if(o.form.$submitted=!0,o.form.$valid){o.project.id=c.getId(),o.project.status=d.status.active,o.project.date_created=new Date,o.project.date_modified=new Date,o.project.updatedBy=r.getLoggedInUser(),o.project.users=[{_id:r.getLoggedInId(),lastName:r.getLoggedInLastName(),firstName:r.getLoggedInFirstName(),displayName:r.getLoggedInName(),displayShortName:r.getLoggedInShortName(),avatar:r.getAvatar(),isAdmin:!0,email:r.getLoggedInEmail(),role:d.projectUserRole.admin,status:d.status.active}];var t=r.getLoggedInUser(),a=m(function(e,o){return g.checkUserRole(t,d.USER_ROLES.ACTIVE_PROJECTS,{user:t},!0).then(e,o)});a.then(function(){n.addOrUpdate(o.project).then(function(t){t&&(o.form.$setPristine(),o.form.$setUntouched(),o.project={},e.$emit("toast-message",l.successMessages.PROJECT_SAVED),e.$emit("projectList-update"),s.updateDiscardedBeforeSave(),i.home())})})}},o.start=function(){o.project={},o.colors=i.colorsCodes(),e.title="Add Project",e.$emit("basic:header",null,null,o,!0,null,!0),s.savePrevious(o,o.project),a.fromTemplateUrl("html/views/modals/colour_codes.html",function(e){o.modal=e},{scope:o,animation:"scale-in"})},o.start(),o.$on("$stateChangeStart",function(e,t,a){o.modal.remove(),s.changeState(e,t,a,o.project)})}])}).call(this);