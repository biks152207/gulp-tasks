/**
 * Created by skyestreamptyltd on 8/9/16.
 */
(function(){
    app.service('gAnalytics',['ANALYTICS_CONFIG','platformService','$state','$rootScope','userModel',function(ANALYTICS_CONFIG,platformService,$state,$rootScope,userModel){
        var self=this;
        var isMobile=platformService.isMobileDevice();
        self.init=function(){
            if(isMobile && window.cordova){
                window.ga.startTrackerWithId(ANALYTICS_CONFIG.MOBILE_ID);
                console.log('analytics registered mobile');
            }
            else{
                ga('create', ANALYTICS_CONFIG.WEB_ID, 'auto');
                ga('send', 'pageview');
                console.log('analytics registered web');
            }

            $rootScope.$on('$stateChangeSuccess',function(){
               setPage();
            });

            $rootScope.$on('login-success',function(){
               loginChanged();
            });
            $rootScope.$on('logoff-success',function(){
                loginChanged();
            });

            $rootScope.$on('set-page',function(evt,title){
                setPage(title);
            })
            loginChanged();
        };

        function setPage(theTitle){
            //var pg=$state.current.url;
            var title=theTitle||$state.current.title || $state.current.url;
            if(!theTitle && $state.current.name=='/task/list/'){
                //if(state.params.type=='inbox'){
                //    title='Inbox_Filters_Task_List';
                //}
                //else if(state.params.type=='today'){
                //    title='Today_Filters_Task_List';
                //}
                //else
                if($state.params.type=='next7days'){
                    title='Next7Days_Filters_Task_List';
                }
                else{
                    title= _.capitalize($state.params.type)+'_Filters_Task_List';
                }
                //else if(state.params.type=='overdue'){
                //    title='Overdue_Filters_Task_List';
                //}
                //else if(state.params.type=='watching'){
                //    title='Watching_Filters_Task_List';
                //}
                //else if(state.params.type=='favourites'){
                //    title='Favourites_Filters_Task_List';
                //}
            }

            if(isMobile && window.cordova){
                window.ga.trackView(title);

            }
            else {
                ga('set','page',title);
                ga('send','pageview');
            }

        }

        function loginChanged() {
            var isAuthenticated = userModel.isAuthenticated();
            var email;
            if (isAuthenticated) {
                email = userModel.getLoggedInEmail();
            }
            else {
                email = null;
            }

            if (isMobile && window.cordova) {
                window.ga.setUserId(email);
            }
            else {
                ga('set', 'userId', email);
            }

        }
    }]);
})();