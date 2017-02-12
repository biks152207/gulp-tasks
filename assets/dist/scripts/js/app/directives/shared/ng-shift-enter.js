(function(){
    app.directive('ngShiftEnter', function() {
        return function(scope, element, attrs) {
            var map = {16: false, 13: false};

            element.bind("keydown", function(event) {
                if (event.which in map) {
                    map[event.which] = true;
                    if (map[16] && map[13]) {

                        scope.$apply(function(){
                            scope.$eval(attrs.ngShiftEnter, {'event': event});
                        });
                        event.preventDefault();
                    }
                }
            });
            element.bind("keyup", function(event) {
                if (event.which in map) {
                    map[event.keyCode] = false;
                }
            });
        };
    })
}).call(this);