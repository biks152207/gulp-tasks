!function(){app.directive("clockPicker",["date",function(e){return{restrict:"EA",require:"ngModel",scope:{datetime:"=ngModel"},link:function(n,t,o,c){$(t).clockpicker({autoclose:!1,donetext:"",appendTo:$(t),placement:"none",stayOpen:!0,change:function(n){console.log(n);var t=((n+"").split(":"),e.getTimeFromString(n));c.$setViewValue(t),console.log(t)}}),c.$render=function(){var n=$(t).data("clockpicker"),o=e.getUnFormattedTimeString(c.$modelValue);n.setClock(o)}}}}])}();