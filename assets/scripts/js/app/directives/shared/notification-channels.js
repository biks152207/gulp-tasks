(function () {
    app.directive('notificationChannels', [ 'userModel', 'stringService', function (userModel, stringService) {
        return {
            restrict: 'E',
            replace: true,
            scope:{
                channels: '=',
                assignee: '='
            },
            template: '<span>{{channelList}}</span>',
            link: function ($scope, $element, $attributes) {

                $scope.$watch('channels', function(){
                    var channelNames = [];
                    var loggedInId = userModel.getLoggedInId();

                    if($scope.channels.email.value){
                        channelNames.push($scope.channels.email.title);
                    }
                    if($scope.channels.push.value){
                        channelNames.push($scope.channels.push.title);
                    }

                    channelNames = channelNames.join(', ');
                    var index= channelNames.lastIndexOf(',');
                    if(index!=-1 ){
                        channelNames = channelNames.substring(0, index)+' and '+ channelNames.substring(index+1);
                    }
                    channelNames = channelNames.replace(/, $/, " and ");
                    if($scope.assignee){
                        if($scope.assignee._id!= loggedInId) $scope.channelList = stringService.EMPTY;
                        else $scope.channelList = channelNames+": ";
                   }
                    else $scope.channelList = channelNames;
                });

            }
        };
    } ]);
}).call(this);
