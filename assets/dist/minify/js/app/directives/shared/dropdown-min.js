(function(){app.directive("select2",["$timeout","$parse",function(e,i){return{restrict:"AC",require:"ngModel",scope:{placeholder:"@"},link:function(i,t,n){e(function(){t.select2({minimumResultsForSearch:1/0,placeholder:i.placeholder}),t.select2Initialized=!0});var c=function(){t.select2Initialized&&e(function(){t.trigger("change")})},l=function(){t.select2Initialized&&e(function(){t.select2("destroy"),t.select2({minimumResultsForSearch:1/0,placeholder:i.placeholder})})};if(i.$watch(n.ngModel,c),n.ngOptions){var a=n.ngOptions.match(/ in ([^ ]*)/)[1];i.$watch(a,l)}n.ngDisabled&&i.$watch(n.ngDisabled,c)}}}])}).call(this);