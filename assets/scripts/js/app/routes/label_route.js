(function() {
    app.config(function($stateProvider) {
        var platform = ionic.Platform.platform();
        var isMobileDevice = platform === 'android' || platform === 'ios';
        $stateProvider.state('/label/add', {
            url: '/label/add',
            views: {
                header: {
                    controller: 'basicHeaderController',
                    templateUrl: 'html/views/shared/_basic_header.html'
                },
                main: {
                    templateUrl: 'html/views/partials/label/add_label.html'
                }
            },
            state: 'label',
            cache: false,
            requireLogin: true,
            title:'Labels_Add'
        })
            .state('/label/edit', {
            url: '/label/edit/:id',
            views: {
                header: {
                    controller: 'basicHeaderController',
                    templateUrl: 'html/views/shared/_basic_header.html'
                },
                main: {
                    templateUrl: 'html/views/partials/label/edit_label.html'
                }
            },
            state: 'label',
            cache: false,
            requireLogin: true,
            title:'Labels_Edit'
        })
            .state('/label/details', {
            url: '/label/details/:id',
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
            state:'label',
            cache: false,
            requireLogin: true,
            isListView: true,
            sortKey:'label',
            title:'Labels_Task_List'
        })


            
    });

}).call(this);
