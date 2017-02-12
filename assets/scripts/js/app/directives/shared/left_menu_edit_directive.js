/**
 * Created by yangli on 4/01/15.
 */

app.directive('leftMenuEdit', function($timeout){
    return {
        restrict: 'A',
        link: function(scope, elm, attr){
            var element = elm[0];

            elm.bind('blur', function(){
                elm.attr('disabled', true);
            });

            scope.$watch(attr.leftMenuEdit, function(newVal){
                newVal && $timeout(function() {
                    elm.removeAttr('disabled');
                    element.focus()
                });
            })
        }
    }
});