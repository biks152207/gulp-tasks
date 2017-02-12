(function () {
    app.directive('focusMe',['$parse','$ionicScrollDelegate','$location','$timeout',function($parse,$ionicScrollDelegate,$location,$timeout){
        return {
            restrict:'AE',

            link:function(scope,ele,attrs){
                console.log('focus me called');
                var triggered=false;
                function trigger(){
                    if(triggered)return;
                    var id=$location.search().focusMe;
                    if(id===undefined) return;
                    var ele=$('#'+id);
                    if(ele.length>0 ){

                        var pos=ele.position();
                        var top=pos.top;
                        var left=pos.left;
                        if(attrs.focusMeOffsetTop){
                            top-=parseInt(attrs.focusMeOffsetTop);
                        }
                        $ionicScrollDelegate.scrollTo(left,top);
                        //ele.toggle( "highlight" );
                        triggered=true;
                        var backgroundElement=ele;
                        if(attrs.focusMeBackgroundSelector){
                            backgroundElement=$(attrs.focusMeBackgroundSelector,ele);
                        }
                        backgroundElement.animate({backgroundColor:'#e5eff7'},"fast")
                            .animate({backgroundColor:'none'},"fast")
                            .animate({backgroundColor:'#e5eff7'},"fast")
                            .animate({backgroundColor:'none'},"fast")
                            .promise().then(function(){
                                console.log('animation complete');
                                console.log(ele);

                            });
                        return;


                    }
                    else{
                        console.log('element with id '+$location.search().focusMe+'not found');
                    }

                }
                var oldtimeout;
                //console.log(scope[attrs.watch]);
                if(attrs.watch){
                    scope.$watch(attrs.watch,function(newVal,oldVal){

                        //console.log(newVal.length);

                        if(newVal!==undefined){
                            if(oldtimeout){
                                $timeout.cancel(oldtimeout);
                            }
                            oldtimeout=$timeout(function(){
                                trigger();
                            },200);

                        }
                    });

                }
                else{
                    trigger();
                }


            }
        };
    }]);


}).call(this);