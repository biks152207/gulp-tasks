(function() {
    app.directive('copyToClipboard',  ["$window", function ($window) {
            var body = angular.element($window.document.body);
            var textarea = angular.element('<textarea/>');
            textarea.css({
                position: 'fixed',
                opacity: '0'
            });

            function copy(toCopy) {
                textarea.val(toCopy);
                body.append(textarea);
                textarea[0].select();

                try {
                    var successful = document.execCommand('copy');
                    if (!successful) throw successful;
                } catch (err) {
                    if(window.cordova){
                        cordova.plugins.clipboard.copy(toCopy);
                    }
                    //window.prompt("Copy to clipboard: Ctrl+C, Enter", toCopy);
                }
                textarea.remove();
            }

            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element.bind('click', function (e) {
                        copy(attrs.copyToClipboard);
                    });
                }
            }
        }])
}).call(this);
