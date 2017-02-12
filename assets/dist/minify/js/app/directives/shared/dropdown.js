(function () {
    app.directive("select2", ["$timeout", "$parse", function($timeout, $parse) {
        return {
            restrict: 'AC',
            require: 'ngModel',
            scope: {
                placeholder: "@"
            },
            link: function(scope, element, attrs) {
                $timeout(function() {
                    element.select2({
                        minimumResultsForSearch: Infinity,
                        placeholder: scope.placeholder
                    });
                    element.select2Initialized = true;
                });

                var refreshSelect = function() {
                    if (!element.select2Initialized) return;
                    $timeout(function() {
                        element.trigger('change');
                    });
                };

                var recreateSelect = function () {
                    if (!element.select2Initialized) return;
                    $timeout(function() {
                        element.select2('destroy');
                        element.select2({
                            minimumResultsForSearch: Infinity,
                            placeholder: scope.placeholder
                        });
                    });
                };

                scope.$watch(attrs.ngModel, refreshSelect);

                if (attrs.ngOptions) {
                    var list = attrs.ngOptions.match(/ in ([^ ]*)/)[1];
                    // watch for option list change
                    scope.$watch(list, recreateSelect);
                }

                if (attrs.ngDisabled) {
                    scope.$watch(attrs.ngDisabled, refreshSelect);
                }
            }
        };
    }]);

}).call(this);