(function(){
    app.service('dbEnums', function(){
        var self  = this;

        self.collections = {
            Filter: 'Filter',
            Label: 'Label',
            Notification: 'Notification',
            Project: 'Project',
            Settings: 'Settings',
            Task: 'Task',
            User: 'User'
        };

        self.events = {
            Filter: {

                'addOrUpdate': 'addOrUpdate',
                'delete': 'delete'
            },
            Label: {

                'addOrUpdate': 'addOrUpdate',
                'delete': 'delete'
            },
            Project: {

                'addOrUpdate': 'addOrUpdate',
                'archive': 'archive',
                'delete': 'delete',
                'deleteUser' : 'deleteUser',
                'left': 'left',
                'reorder': 'reorder',
                'sendInvitation': 'sendInvitation',
                'unArchive': 'unArchive',
                'adminInvitation':'adminInvitation'
            },
            Settings:{
                'update': 'update',
                'sortUpdate':'sortUpdate',
                'filterViewUpdate':'filterViewUpdate'
            },
            Task: {
                'add': 'add',
                'addNote':'addNote',
                'bulkComplete': 'bulkComplete',
                'bulkDueDateUpdate': 'bulkDueDateUpdate',
                'bulkFavourites': 'bulkFavourites',
                'delete': 'delete',
                'deleteNote': 'deleteNote',
                'deleteReminder': 'deleteReminder',
                'reminderExecuted': 'reminderExecuted',
                'update': 'update',
                'updateNote': 'updateNote',
                'moveTaskOrder':'moveTaskOrder'
            }
        };

        self.keys = {
            ASSIGNEE: 'Assignee',
            CREATE: 'Create',
            DUE: 'Due',
            FILE: 'file',
            NOTE: 'Note',
            PRIORITY: 'Priority',
            PROJECT: 'Project',
            STATUS: 'Status',
            TITLE: 'Title',
            WATCHER: 'Watcher',
            DELETE_VALIDATION_REGEX:/^delete$/i,
            COPY_TASK_PREFIX:'COPY - ',
            TASK_DELETE:'TASK_DELETE'
        };

        self.projectUserRole = {
            admin: 'admin',
            approval: 'waiting for approval',
            pending: 'pending user',
            user: 'user'
        };

        self.status = {
            accepted:'accepted',
            active: 'active',
            approval:'approval',
            archived:'archived',
            complete:'complete',
            deleted: 'deleted',
            inactive: 'inactive',
            pending:'pending',
            rejected: 'rejected',
            reopened:'reopen'

        };

        self.taskUserRole ={
            admin: 'admin',
            assignee: 'assignee',
            user: 'user',
            watcher: 'watcher'
        };

        self.USER_ROLES={
            ACTIVE_PROJECTS:'active_projects',
            ACTIVE_TASKS:'active_tasks',
            ASSIGNEE_PROJECT:'assignee_project',
            MAX_USERS_PROJECT:'max_users_project',
            LABELS:'labels',
            LABELS_ASSIGN:'labels_assign',  /*If feature present, task can be assigned with labels*/
            EMAIL_NOTIFICATIONS:'email_notifications',
            CUSTOM_FILTERS:'custom_filters',
            SEARCH:'search',
            FILE_UPLOAD:'file_upload',
            FILE_UPLOAD_SIZE:'file_upload_size',
            FILE_STORAGE_MAX:'file_storage_max',
            MY_FEEDS:'my_feeds',
            TASK_HISTORY:'task_history'


        }
               //self.defaultSettings

    });
}).call(this);
