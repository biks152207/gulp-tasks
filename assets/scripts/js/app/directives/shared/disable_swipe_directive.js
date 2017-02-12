
(function(){
    app.directive('disableSwipe',['$ionicGesture',function($ionicGesture){
        return {
            restrict:'A',
            link:function(scope,element,attr){

                var swipeGesture = $ionicGesture.on('swipe', swipeHandler, element);

                scope.$on('$destroy',function(){
                    $ionicGesture.off(swipeGesture, 'swipe', swipeHandler);
                });


                function swipeHandler(e){
                    var direction= e.gesture.direction;
                    console.log('gesture event');
                    console.log(arguments);
                    if(direction=='left'){
                        console.log('cancelling gesture left');
                        e.preventDefault();
                        return false;
                    }

                }

            }
        }
    }]);
})();

