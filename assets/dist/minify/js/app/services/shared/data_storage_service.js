(function () {
    app.service('sharedData',["$state", "settingsService", function ( $state, settingsService) {

        var self = this;

        self.EVENT_ICONS = {
            ASSIGNEE: 'tdzicon-people',
            CREATE: 'tdzicon-plus-circled',
            DUE: 'tdzicon-calendar-empty',
            FILE: 'tdzicon-attach',
            NOTE: 'tdzicon-note',
            PRIORITY: 'tdzicon-priorities',
            PROJECT: 'tdzicon-square',
            REMINDER: 'tdzicon-reminder',
            STATUS: 'tdzicon-tick',
            TITLE: 'tdzicon-mini-task-desc',
            USER_JOINED: 'tdzicon-square',
            USER_LEFT: 'tdzicon-square',
            USER_REMOVED: 'tdzicon-square',
            WATCHER: 'tdzicon-viewer',
            REOPEN:'tdzicon-tick-circle',
            TASK_DELETE:'tdzicon-delete',
            ROLE_CHANGED:'tdzicon-square'
        };

        self.colorsCodes = function () {
            return [
                {color: '#457AAE'},
                {color: '#B65988'},
                {color: '#19BD9B'},
                {color: '#2ECD71'},
                {color: '#3598DC'},
                {color: '#9A59B5'},
                {color: '#34495E'},

                {color: '#26517C'},
                {color: '#AE4474'},
                {color: '#17A086'},
                {color: '#27AE5F'},
                {color: '#2A80B9'},
                {color: '#8F44AD'},
                {color: '#2D3E50'},

                {color: '#F5DB62'},
                {color: '#D45B7E'},
                {color: '#F2C40F'},
                {color: '#E77E22'},
                {color: '#E84C3D'},
                {color: '#ECF0F1'},
                {color: '#A3B1B2'},

                {color: '#F4CD16'},
                {color: '#D92F5E'},
                {color: '#F39C11'},
                {color: '#D25400'},
                {color: '#BF3A2B'},
                {color: '#BEC3C7'},
                {color: '#7E8C8D'}
            ];

        };

        self.STATE = {
            ASSIGNEE: 'assignee',
            FILTER: 'filter',
            LABEL: 'label',
            PROJECT: 'project',
            TASK: 'task',
            CLOSED:'closed'
        };

        self.home = function(){
            var userSettings = settingsService.getSettings();
            $state.go('/task/list/', {type: userSettings.default_view.value});
        };


        self.taskHome = function(task,focusId){
            if(task.project.id){
                var parames={id:task.project.id};
                if(focusId) parames.focusMe=focusId;

                $state.go('/project/details', parames);
            }
            else  {
                var parames={type:'inbox'};
                if(focusId) parames.focusMe=focusId;
                $state.go('/task/list/', parames);
            }

        };

        self.inbox = {id: '', color: '', hasBorder: true, name: 'Inbox', users: []};

        self.BASIC_TASK = {
            project: {
                id: 0,
                name: 'Inbox'
            },
            hasDueDate: false,
            recurrence:{},
            assignee:{},
            watchers:[],
            labels: [],
            notes:[],
            reminders: []
        };

        self.LEFT_MENU_KEYS = {

           ASSIGNEE: 'assignee',
            FAVOURITES: 'favourites',
            INBOX: 'inbox',
            FILTER: 'filter',
            LABEL: 'label',
            MY_FEEDS: 'myFeed',
            NEXT_7_DAY: 'next7days',
            OVERDUE: 'overdue',
            PROJECT: 'project',
            TODAY: 'today',
            WATCHING: 'watching'

        };

        self.leftMenuSingleItems = function(){
            return [
                {
                    title: 'Inbox',
                    value: 'inbox',
                    icon: 'tdzicon-inbox'
                },
                {
                    title: 'Today',
                    value: 'today',
                    icon: 'tdzicon-today'
                },
                {
                    title: 'Next 7 Days',
                    value: 'next7days',
                    icon: 'tdzicon-next7days'
                },
                {
                    title: 'Overdue',
                    value: 'overdue',
                    icon: 'tdzicon-overdue'
                },
                {
                    title: 'My Feeds',
                    value: 'myFeed',
                    icon: 'ion-ios-pulse'
                },
                {
                    title: 'Watching',
                    value: 'watching',
                    icon: 'tdzicon-viewer'
                },
                {
                    title: 'Favourites',
                    value: 'favourites',
                    icon: 'tdzicon-favourites'
                }


            ]
        }


    }]);
}).call(this);
