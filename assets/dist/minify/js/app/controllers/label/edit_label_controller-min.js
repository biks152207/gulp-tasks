(function(){app.controller("editLabelController",["$rootScope","$state","$scope","$ionicModal","$stateParams","labelService","sharedData","message","discardChange",function(e,a,t,o,l,s,n,i,c){t.selectColor=function(e){t.label.color=e},t.saveKeyEnter=function(e){13==e.keyCode&&t.save()},t.save=function(){t.form.$submitted=!0,t.form.$valid&&(c.isChanged(t.label)?s.addOrUpdate(t.label).then(function(a){a&&(e.$emit("toast-message",i.successMessages.LABEL_EDITED),e.$emit("labelList-update"),c.updateDiscardedBeforeSave(),n.home())}):(c.updateDiscardedBeforeSave(),n.home()))},t.start=function(){s.findById(l.id).then(function(o){o?(t.label=o,e.title=t.label.name,t.colors=n.colorsCodes(),e.$emit("basic:header",a.current.state,t.label,t,!0),c.savePrevious(t,t.label)):n.home()}),o.fromTemplateUrl("html/views/modals/colour_codes.html",function(e){t.modal=e},{scope:t,animation:"scale-in"})},t.start(),e.$on("$stateChangeStart",function(e,a,o){t.modal.remove(),c.changeState(e,a,o,t.label)})}])}).call(this);