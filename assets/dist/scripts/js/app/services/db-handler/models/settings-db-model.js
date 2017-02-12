(function(){
    app.service('settingsModel', ["$rootScope", "$timeout", "$window", function($rootScope, $timeout, $window){
        var self  = this;

        //Settings is using local storage as a DB which is different from other model
        self.addOrUpdate = function(settings, cb){
            $window.localStorage.setItem('settings', JSON.stringify(settings));
            $timeout(function(){
                $rootScope.$emit('settings-update', settings);
            });
            cb();
        };

        self.get= function(cb){
            var settings=JSON.parse($window.localStorage.getItem('settings'));
            if(settings && settings.reminder && (!settings.reminder.taskCreateReminderNotificationChannels || !settings.reminder.taskCreateReminderNotificationChannels.email.title)){
                settings.reminder.taskCreateReminderNotificationChannels=DEFAULTS.defaultSettings.taskCreateReminderNotificationChannels;
            }
            cb(settings);

        };

        self.setAllFilterViews=function(filterViews){

            $window.localStorage.setItem('filterViews',JSON.stringify(filterViews));

        }

        self.setAllSortOptions=function(sortOptions){

            $window.localStorage.setItem('sortOptions',JSON.stringify(sortOptions));

        }

    }]);
}).call(this);
