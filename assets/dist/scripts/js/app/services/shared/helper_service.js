(function() {
    app.service('helperService', ['date',function (date) {

        var self=this;

        self.getScheduledTime = function(reminder, dueDate){
            var scheduleTime;
            if(reminder.time.id){
                scheduleTime = new Date(reminder.time.value);
            }
            else{
                scheduleTime = new Date(dueDate);
                scheduleTime.setMinutes(scheduleTime.getMinutes() - self.timeDuration[reminder.time.value].minutes);
            }
            return scheduleTime;
        };

        self.getUserByRole = function(users,role){
            var userByRole= _.find(users,function(usr){
               return usr.role==role && usr._id;
            });
            return userByRole;

        };

        self.timeDuration= [
            {title: '5 minutes before',
                value: 0,
                minutes:5
            },
            {title: '15 minutes before',
                value: 1,
                minutes: 15
            },
            {title: '30 minutes before',
                value: 2,
                minutes: 30
            },
            {title: '1 hour before',
                value: 3,
                minutes: 60
            },
            {title: '2 hours before',
                value: 4,
                minutes: 120
            },
            {title: '3 hours before',
                value: 5,
                minutes: 180
            },
            {title: '6 hours before',
                value: 6,
                minutes: 360
            },
            {title: '12 hours before',
                value: 7,
                minutes: 720
            },
            {title: '1 day before',
                value: 8,
                minutes: 1440
            }
        ];


    }]);
})();