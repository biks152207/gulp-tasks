(function () {
    app.controller('generalSettingController', function ($rootScope, $scope, $state, $ionicModal, settingsService, discardChange, message) {


        function setDropDowns(){
            $scope.dropdowns = {
                general: true,
                dates: true
            }
        }

        function createModals(){

            $ionicModal.fromTemplateUrl('html/views/modals/settings/general/default_view.html', function ($ionicModal) {
                $scope.settingsDefaultViewModal = $ionicModal;
            }, {
                scope: $scope,
                animation: 'scale-in'
            });

            $ionicModal.fromTemplateUrl('html/views/modals/settings/general/float_button.html', function ($ionicModal) {
                $scope.settingsFloatButtonModal = $ionicModal;
            }, {
                scope: $scope,
                animation: 'scale-in'
            });

            $ionicModal.fromTemplateUrl('html/views/modals/settings/general/start_day.html', function ($ionicModal) {
                $scope.settingsStartDayModal = $ionicModal;
            }, {
                scope: $scope,
                animation: 'scale-in'
            });

            $ionicModal.fromTemplateUrl('html/views/modals/settings/general/date_format.html', function ($ionicModal) {
                $scope.settingsDateFormatModal = $ionicModal;
            }, {
                scope: $scope,
                animation: 'scale-in'
            });

            $ionicModal.fromTemplateUrl('html/views/modals/settings/general/time_format.html', function ($ionicModal) {
                $scope.settingsTimeFormatModal = $ionicModal;
            }, {
                scope: $scope,
                animation: 'scale-in'
            });

        }

        function setSettings(){
            $scope.generalSettings = settingsService.getSettings();
            discardChange.savePrevious($scope, $scope.generalSettings);
        }

        $scope.redirectTo = function(url){
            $state.transitionTo(url);
        };

        $scope.toggleDropdown = function(key){

            $scope.dropdowns[key] = !$scope.dropdowns[key];
        };

        $scope.setDefaultView = function(view){

            $scope.generalSettings.default_view = view;
        };

        $scope.setFloatButton= function(float_button){

            $scope.generalSettings.float_button = float_button;
        };

        $scope.setStartDay = function(day){

            $scope.generalSettings.start_day = day;
        };
        
        $scope.setDateFormat = function(date_format){

            $scope.generalSettings.date_format = date_format;
        };

        $scope.setTimeFormat = function(time_format){

            $scope.generalSettings.time_format = time_format;
        };

        $scope.save = function (){
            if(discardChange.isChanged($scope.generalSettings)){
                settingsService.update($scope.generalSettings).then(function(){
                    $scope.discarded = true;
                    $rootScope.$emit('toast-message', message.successMessages.SETTINGS_SAVED);
                    discardChange.updateDiscardedBeforeSave();
                    $state.go('/settings');
                });
            }else{
                discardChange.updateDiscardedBeforeSave();
                $state.go('/settings');
            }

        };

        $scope.start = function(){

            $scope.title = 'General';
            setDropDowns();
            createModals();
            setSettings();
            $scope.defaultViews = settingsService.defaultViews;
            $scope.floatButtons = settingsService.floatButtons;
            $scope.startDays = settingsService.startDays;
            $scope.dateFormats = settingsService.dateFormats;
            $scope.timeFormats = settingsService.timeFormats;
            $rootScope.$emit('basic:header', null, null, $scope, true, null, true);


        };

        $scope.start();

        var settingsListener = $rootScope.$on('settings-update', function(){
            setSettings();
        });

        $scope.$on('$destroy',settingsListener);

        $scope.$on('$stateChangeStart', function (event, toState, toParams) {

                discardChange.changeState(event, toState, toParams, $scope.generalSettings);
        });

    });

}).call(this);
