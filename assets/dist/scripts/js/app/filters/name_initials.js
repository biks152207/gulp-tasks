(function() {
    app.filter('nameShorten', function() {
        return function(input) {
            var values;
            values = input.split(' ');
            return values[0].charAt(0).toUpperCase() + values[values.length - 1].charAt(0).toUpperCase();
        };
    });

}).call(this);
