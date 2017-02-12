(function() {
    app.config(function($stateProvider) {
        var platform = ionic.Platform.platform();
        var isMobileDevice = platform === 'android' || platform === 'ios';
        $stateProvider.state('/task/list/', {
            url: '/task/list/:type/:id',

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
                         return  'html/views/partials/task/list-web.html';
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
            state: 'task',
            cache: false,
            requireLogin: true,
            isListView: true,
            skipNavigation:true,
            skipParams:{type:['project','label','filter','assignee']},
            sortKey:'list',
            title:'Fixed_Filters_Task_List'

        })
        .state('/task/closed', {
            url: '/task/closed?tasks',

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
                        return  'html/views/partials/task/list-web.html';
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
            state: 'closed',
            cache: false,
            requireLogin: true,
            isListView: true,
            sortKey:'closed',
            title:'Task_Closed_View'

        })
        .state('/task/add', {
            url: '/task/add',
            views: {
                header: {
                    controller: 'taskHeaderController',
                    templateUrl: 'html/views/shared/_task_header.html'
                },
                main: {
                    templateUrl: 'html/views/partials/task/add_task.html'
                }
            },
            cache: false,
            requireLogin: true,
            title:'Task_Add'

        })
        .state('/task/edit', {
            url: '/task/edit/:id?showType',
            views: {
                header: {
                    controller: 'taskHeaderController',
                    templateUrl: 'html/views/shared/_task_header.html'
                },
                main: {
                    templateUrl: function(){
                        if(isMobileDevice){
                            return 'html/views/partials/task/edit-task-mobile.html';
                        }
                        return 'html/views/partials/task/edit-task-web.html';
                    }
                }
            },
            state: 'task',
            cache: false,
            requireLogin: true,
            stateGroup:'task-edit',
            title:'Task_Edit'


        })
        .state('/task/note', {
            url: '/task/note/:id?focusMe',
            views: {
                header: {
                    controller: 'taskHeaderController',
                    templateUrl: 'html/views/shared/_task_header.html'
                },
                main: {
                    controller: 'noteTaskController',
                    templateUrl: 'html/views/partials/task/note.html'
                }
            },
            state: 'task',
            cache: false,
            requireLogin: true,
            stateGroup:'task-edit',
            title:'Task_Notes'

        })
        .state('/task/my-feed', {
            url: '/task/my-feed',

            views: {
                header: {
                    controller: 'listHeaderController',
                    templateUrl: 'html/views/shared/_list_header.html'
                },
                main: {
                    controller: 'taskMyFeedController',
                    templateUrl: 'html/views/partials/task/my-feed.html'
                }
            },
            cache: false,
            requireLogin: true,
            title:'My_Feeds'
        })

    });

}).call(this);
