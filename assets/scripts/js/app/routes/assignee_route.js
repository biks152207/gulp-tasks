(function() {
    app.config(function($stateProvider) {
        var platform = ionic.Platform.platform();
        var isMobileDevice = platform === 'android' || platform === 'ios';
        $stateProvider.state('/assignee/details', {
            url: '/assignee/details/:id',
            views: {
                header: {
                    controller: 'listHeaderController',
                    templateUrl: 'html/views/shared/_list_header.html'
                },
                main: {
                    controller: 'taskListController',
                    templateUrl: function(){
                        if(isMobileDevice){
                            return 'html/views/partials/task/list-mobile.html';
                        }
                        return 'html/views/partials/task/list-web.html';
                    }
                },
                'right-default-view':{
                    controller: 'defaultViewController',
                    templateUrl: 'html/views/shared/right-default-view.html'
                },
                footer: {
                    controller: 'taskFooterController',
                    templateUrl: 'html/views/shared/_task_footer.html'
                }
            },
            params:{'focusedTaskId':''},
            state: 'assignee',
            cache: false,
            requireLogin: true,
            sortKey:'assignee',
            title:'Assignee_Task_List'

        })

    });

}).call(this);
