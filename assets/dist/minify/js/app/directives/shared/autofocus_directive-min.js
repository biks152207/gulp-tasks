(function(){app.directive("autoFocus",["$timeout",function(o){return{restrict:"A",link:function(n,i,u){if(n.$eval(u.autoFocus)!==!1){var c=i[0];o(function(){c.focus(),window.cordova&&window.cordova.plugins&&window.cordova.plugins.Keyboard&&window.cordova.plugins.Keyboard.show()},300)}}}}]),app.directive("focusInput",["$timeout",function(o){return{link:function(n,i,u){o(function(){i[0].focus(),window.cordova&&window.cordova.plugins&&window.cordova.plugins.Keyboard&&cordova.plugins.Keyboard.show()},300)}}}])}).call(this);