(function(){app.directive("stickyHeader",["$ionicPosition","$compile","$rootScope",function(e,t,n){return{restrict:"A",require:"^$ionicScroll",link:function(o,i,l,a){var r,s=angular.element(a.element),c=ionic.Platform.isIOS()?90:ionic.Platform.isAndroid()?70:5,f=function(e,t){for(var n=e.getElementsByTagName("textarea"),o=t.getElementsByTagName("textarea"),i=e.getElementsByTagName("select"),l=t.getElementsByTagName("select"),a=0,r=n.length;a<r;++a)o[a].value=n[a].value;for(var a=0,r=i.length;a<r;++a)l[a].value=i[a].value},u=function(n){r=n.clone().css({position:"absolute",top:e.position(s).top+"px",left:0,right:0}),l.ionStickyClass=l.ionStickyClass?l.ionStickyClass:"assertive",f(n[0],r[0]),r[0].className+=" "+l.ionStickyClass,r.removeAttr("ng-repeat-start").removeAttr("ng-if"),s.parent().append(r),t(r)(o)},g=function(){r&&r.remove(),r=null};o.$on("$destroy",function(){g(),angular.element(a.element).off("scroll")});var m,p=ionic.throttle(function(t){for(var n=null,o=[],l=i[0].getElementsByClassName("item-divider"),a=0;a<l.length;++a)o.push(angular.element(l[a]));for(var a=0;a<o.length;++a)if(e.offset(o[a]).top-o[a].prop("offsetHeight")<c&&(a===o.length-1||e.offset(o[a+1]).top-(o[a].prop("offsetHeight")+o[a+1].prop("offsetHeight"))>c)){n=o[a][0];break}(m!=n||t)&&(g(),m=n,null!=n&&u(angular.element(n)))},200);s.on("scroll",function(e){p()}),n.$on("update-sticky",function(){p(!0)})}}}])}).call(this);