(function () {
    app.directive('autoFocus', [ '$timeout', function ($timeout) {
        return {
            restrict: 'A',

            link: function ($scope, $element, $attributes) {
                if ($scope.$eval($attributes.autoFocus) !== false) {
                    var element = $element[0];

                    $timeout(function() {
                        element.focus();
                        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {

                            window.cordova.plugins.Keyboard.show(); //open keyboard manually
                        }
                    }, 300);
                }
            }
        };
    } ]);

    app.directive('focusInput', function($timeout) {
        return {
            link: function(scope, element, attrs) {
                $timeout(function() {
                    element[0].focus();
                    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                        cordova.plugins.Keyboard.show();
                    }
                }, 300);
            }
        };
    });

}).call(this);



