(function () {
    app.directive('activeHeader', function () {
        var definition;
        definition = {
            restrict: 'A',
            require: ['activeHeader'],
            controller: function ($location) {
                this.tabCheck = function (route) {

                    return route === '#'+$location.path();
                };
            },
            compile: function () {
                return {
                    pre: function (scope, elm, attrs, ctrl) {

                        scope.ah = ctrl[0];
                    }
                };
            }
        };
        return definition;
    });

}).call(this);
