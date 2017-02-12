(function(){app.controller("viewUsersProjectController",["$rootScope","$scope","$state","$ionicPopup","$stateParams","project","sharedData","message","stringService","userModel",function(e,t,n,s,o,i,r,c,a,p){function d(n,s){switch(n){case u.send:i.sendInvitation(t.project,getInvitedUser(t.invitation.email)).then(function(){t.form.$setPristine(),t.form.$setUntouched(),t.invitation={}});break;case u.resend:var o={projectId:t.project.id,user:s};i.reSendInvitation(o).then(function(t){e.$emit("toast-message",t.message)});break;case u.cancel:i.deleteUser(t.project,s).then(function(){e.$emit("toast-message",c.successMessages.PROJECT_INVITATION_CANCELLED)});break;case u.remove:i.deleteUser(t.project,s).then(function(){e.$emit("toast-message",c.successMessages.PROJECT_USER_DELETED)})}}var u={send:"send",resend:"resend",cancel:"cancel",remove:"remove"};t.invitationPopUp=function(e,n,o){s.show({title:n.title,template:n.message,scope:t,buttons:[{text:a.NO,type:"btn-no",onTap:function(){return!0}},{text:a.YES,type:"btn-yes",onTap:function(){d(e,o)}}]})},t.deleteUser=function(e){t.invitationPopUp(u.remove,c.infoMessages.PROJECT_USER_DELETED,e)},t.reSendInvitation=function(e){t.invitationPopUp(u.resend,c.infoMessages.PROJECT_INVITATION_RESENT,e)},t.deleteInvitation=function(e){t.invitationPopUp(u.cancel,c.infoMessages.PROJECT_INVITATION_CANCELLED,e)},t.start=function(){i.findById(o.id).then(function(s){s?(t.project=s,t.project.users=p.adminTopOnList(t.project.users),e.title="Users: "+t.project.name,t.loginId=p.getLoggedInId(),t.canDeleteUser=i.canDeleteUser(s,p.getLoggedInUser()),e.$emit("basic:header",n.current.state,t.project,t)):r.home()}),i.getAllProjectsUsers().then(function(e){t.allUsers=e})},t.start();var l=e.$on("projectList-update",function(){i.findById(o.id).then(function(e){e&&(t.project=e)})});t.$on("$destroy",function(){l()})}])}).call(this);