(function(){app.directive("confirmInput",function(){return{require:"ngModel",scope:{confirmInput:"=confirmInput"},link:function(n,t,i,r){n.$watch("confirmInput",function(){return r.$setValidity("confirmed",n.confirmInput===t.val())}),t.bind("propertychange keyup change paste",function(){return n.$apply(function(){return r.$setValidity("confirmed",n.confirmInput===t.val())})})}}})}).call(this);