(function(){app.directive("copyToClipboard",["$window",function(o){function c(o){i.val(o),n.append(i),i[0].select();try{var c=document.execCommand("copy");if(!c)throw c}catch(c){window.cordova&&cordova.plugins.clipboard.copy(o)}i.remove()}var n=angular.element(o.document.body),i=angular.element("<textarea/>");return i.css({position:"fixed",opacity:"0"}),{restrict:"A",link:function(o,n,i){n.bind("click",function(o){c(i.copyToClipboard)})}}}])}).call(this);