(function() {
    app.directive('confirmInput', function() {
        return {
            require: "ngModel",
            scope: {
                confirmInput: "=confirmInput"
            },
            link: function(scope, elm, attributes, ngModel) {
                scope.$watch("confirmInput", function() {
                    return ngModel.$setValidity('confirmed', scope.confirmInput === elm.val());
                });
                elm.bind('propertychange keyup change paste', function() {
                    return scope.$apply(function() {
                        return ngModel.$setValidity('confirmed', scope.confirmInput === elm.val());
                    });
                });
            }
        };
    });

}).call(this);
