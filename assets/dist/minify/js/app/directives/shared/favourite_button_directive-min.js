(function(){app.directive("favouriteButton",function(){var t;return t={restrict:"AE",replace:!0,templateUrl:"html/directives/shared/favourite_button_directive.html",scope:{favourited:"@"},controller:function(t){var e;e=function(){return t.favourited=!t.favourited},t.buttonClicked=e}}})}).call(this);