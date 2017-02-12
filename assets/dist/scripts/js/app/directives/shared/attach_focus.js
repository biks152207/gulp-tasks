/**
 * Created by skyestreamptyltd on 6/29/16.
 */

(function(){
    app.directive('attachFocus',['$rootScope','$timeout',function($rootScope,$timeout){
        return {
            restrict:'A',
            link:function(scope,ele,attr){
                var listener=$rootScope.$on('attach-focus',function(event,ky){
                    if(ky===attr['attachFocus'] && $(ele).is(':visible')){
                        $timeout(function(){
                            if($(ele).is(':button')){
                                $(ele).click();
                            }
                            else{
                                $(ele).focus();
                            }

                        });

                    }
                });

                scope.$on('$destroy',function(){
                    listener();
                });
            }
        }
    }]);
})();