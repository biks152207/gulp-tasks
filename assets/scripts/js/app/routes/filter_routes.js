(function() {
    app.config(function($stateProvider) {
        var platform = ionic.Platform.platform();
        var isMobileDevice = platform === 'android' || platform === 'ios';

        $stateProvider.state('/filter/add', {
            url: '/filter/add',
            views: {
                header: {
                    controller: 'basicHeaderController',
                    templateUrl: 'html/views/shared/_basic_header.html'
                },
                main: {
                    templateUrl: 'html/views/partials/filter/add_filter.html'
                }
            },
            state: 'filter',
            cache: false,
            requireLogin: true,
            title:'Custom_Filters_Add'

        })
        .state('/filter/edit', {
            url: '/filter/edit/:id',
            views: {
                header: {
                    controller: 'basicHeaderController',
                    templateUrl: 'html/views/shared/_basic_header.html'
                },
                main: {
                    templateUrl: 'html/views/partials/filter/edit_filter.html'
                }
            },
            state: 'filter',
            cache: false,
            requireLogin: true,
            title:'Custom_Filters_Edit'

        })
        .state('/filter/details', {
            url: '/filter/details/:id',
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
            state: 'filter',
            cache: false,
            requireLogin: true,
            isListView: true,
            sortKey:'filter',
            title:'Custom_Filters_Task_List'
        })



    });

}).call(this);
