(function(){
    app.service('discardChange', function($ionicPopup, $state,  message, stringService){

        var self = this;
        var currentScope;
        var isDiscarded;
        var prevObject;

        self.savePrevious = function(scope, pObject){
            isDiscarded = false;
            currentScope = scope;
            prevObject = angular.copy(pObject);
        };

        self.discardPopup = function (toState, toParams) {
            $ionicPopup.show({
                template: message.infoMessages.DISCARD_CHANGE.message,
                title: message.infoMessages.DISCARD_CHANGE.title,
                scope: currentScope,
                buttons: [{
                    text: stringService.NO,
                    onTap: function () {
                        return true;
                    }
                },
                    {
                        text: stringService.YES,
                        onTap: function () {
                            isDiscarded = true;
                            $state.go(toState.name, toParams);
                        }
                    }]
            });
        };

        self.updateDiscardedBeforeSave = function(){

            isDiscarded  = true;
        };
        self.isChanged = function(newObject){
                return !angular.equals(prevObject, newObject);
        };

        self.changeState = function(event, toState, toParams, object) {

            if(!isDiscarded &&  self.isChanged(object)){
                event.preventDefault();
                self.discardPopup(toState, toParams);
            }
        };


    });
}).call(this);