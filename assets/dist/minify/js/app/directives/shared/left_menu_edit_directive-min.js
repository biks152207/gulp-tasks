app.directive("leftMenuEdit",["$timeout",function(t){return{restrict:"A",link:function(i,n,e){var u=n[0];n.bind("blur",function(){n.attr("disabled",!0)}),i.$watch(e.leftMenuEdit,function(i){i&&t(function(){n.removeAttr("disabled"),u.focus()})})}}}]);