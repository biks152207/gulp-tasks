(function() {

    ionic.Gestures.gestures.Hold.defaults.hold_threshold = 20;

    //var api_link = location.protocol+'//api.dev.todozu.com';  //comment out when run in prod
    var api_link = 'https://api.dev.todozu.com';  //comment out when run in prod
    // var api_link = 'http://localhost:1989';  //comment out when run in dev
    //var api_link = 'http://80586d64.ngrok.io';

    app.constant('API', {
        history: {
            GET:{
                historiesByTask: api_link+'/history/by-task',
                all: api_link+'/history/all'
            }
        },
        notification:{
            getByUserId: api_link+'/notifications/by-userId',
            seen: api_link+'/notifications/seen'
        },
        project: {
            details: api_link + '/project/details',
            reSendInvitation: api_link + '/project/resend-invitation',
            adminInvitation:api_link+'/project/admin-invitation'

        },
        settings:{
            removeAvatar: api_link+'/settings/avatar/remove',
            update: api_link+'/settings/update',
            updateUserName: api_link+'/settings/update-username',
            updateEmail: api_link+'/settings/update-email',
            updateEmailConfirm: api_link+'/update-email-confirm',
            updatePassword: api_link+'/settings/update-password',
            uploadAvatar: api_link + '/settings/avatar/upload',
            deleteAccount:api_link+'/user/delete-account',
            checkForDelete:api_link+'/user/check-for-delete'
        },
        sync:{
            pull: api_link+'/sync/pull',
            push: api_link+'/sync/push'
        },
        task: {
            GET:{
                histories: api_link+'/task/histories/',
                allHistories: api_link+'/task/all-histories',
                getCompleted:api_link+'/task/completed',
                view:api_link+'/task/view/'
            },
            uploadNote: api_link + '/task/note/upload',
            unCompleteTasks:api_link+'/task/uncomplete'

        },
        user: {
            register: api_link+'/user',
            pull: api_link+'/sync-all',
            forgotPassword: api_link + '/forgot-password',
            resetPassword: api_link + '/reset-password',
            login: api_link + '/user/login',
            logout: api_link+'/user/logout',
            validatePassword:api_link+'/user/validate-password',
            registerDeviceInfo:api_link+'/user/register-device-info',
            totalStorage:api_link+'/user/totalstorage'
        }


    });

    app.constant('CONSTANT',{
        website: 'https://todozu.com',
        iconUrl:'https://api.dev.todozu.com/icons/icon.png',
        upgradeUrl:'https://todozu.com/pricing',
        version: '0.0.4',
        //file_handler_link : 'http://localhost:1989/serve/file', //comment out when run in dev
        file_handler_link : 'https://api.dev.todozu.com/serve/file', //
        //app_link : 'http://localhost:3000', //comment out when run in dev
        app_link : 'https://app.dev.todozu.com',  //comment out when run in prod
        //api_link : 'http://localhost:1989' //comment out when run in dev
        api_link : 'https://api.dev.todozu.com'  //comment out when run in prod
        //api_link : 'http://80586d64.ngrok.io'
    });

    app.constant('RESPONSE_CODE',{
        SUCCESS: 200,
        ERROR: 500
    });

    app.constant('PUSH_NOTIFICATION_CONFIG',{
        APP_ID: 'b3cfc522-0d06-4454-98e8-d457d7d5b85f',
        SUB_DOMAIN_NAME: 'todozu',
        GOOGLE_PROJECT_NUMBER: '360688121111'

    });

    app.constant('ANALYTICS_CONFIG',{
        MOBILE_ID:'UA-56174322-7',
        WEB_ID:'UA-56174322-8'
    })

    app.constant('DEFAULTS',{
        'defaultSettings': {
            taskCreateReminderNotificationChannels: {
                email: {
                    title: 'Email',
                    value: false,
                    notified: true
                },
                push: {
                    title: 'Push',
                    value: true,
                    notified: false
                }

            }
        }
    });


}).call(this);
