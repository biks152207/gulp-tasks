(function () {
    app.service('dueService', function (date, stringService) {

        var self = this;

        self.REPEAT_BY_ITEMS = [
            {checked: false, code: 0, name: "day of the month"},
            {checked: false, code: 1, name: "day of the week"}];

        self.REPEAT_ITEMS = {
            DAILY: {
                title:'Daily',
                plural: 'days'
            },
            WEEKLY: {
                title: 'Weekly',
                plural: 'weeks'
            } ,
            MONTHLY:{
                title: 'Monthly',
                plural: 'months'
            },
            YEARLY: {
                title: 'Yearly',
                plural: 'years'
            }
        };

        self.REPEAT_KEY = {
            DAILY: 'DAILY',
            WEEKLY: 'WEEKLY',
            MONTHLY: 'MONTHLY',
            YEARLY: 'YEARLY'
        };

        self.REPEAT_ON_ITEMS = [ {checked: false, code: 'S', title: 'Sunday'},
            {checked: false, code: 'M', title: 'Monday'},
            {checked: false, code: 'T', title: 'Tuesday'},
            {checked: false, code: 'W', title: 'Wednesday'},
            {checked: false, code: 'T', title: 'Thursday'},
            {checked: false, code: 'F', title: 'Friday'},
            {checked: false, code: 'S', title: 'Saturday'}];

        function validateRecurring(date, recurrence,date_modified) {

            recurrence.due_date = date;
            switch (recurrence.repeatEnd.id) {

                case 1:
                    if(date_modified){
                        recurrence.repeatEnd.remainingOccurrence--;
                    }
                    recurrence.isRecurring = !!recurrence.repeatEnd.remainingOccurrence;


                    break;
                case 2:
                    var endDate = new Date (recurrence.repeatEnd.end);
                    endDate.setDate(endDate.getDate()+1);
                    endDate.setHours(0,0,0,0);
                    recurrence.isRecurring = date < endDate;
                    break;
            }

            return recurrence;
        }

        self.getSummary = function(recurrence){

            if(recurrence.isRecurring){

                var today = new Date();
                recurrence.starts_on = new Date(recurrence.starts_on);
                var summary = '';
                if (!recurrence.every || recurrence.every <=1) summary = self.REPEAT_ITEMS[recurrence.repeat].title;
                else summary = 'Every ' + recurrence.every + ' ' + self.REPEAT_ITEMS[recurrence.repeat].plural;


                if (recurrence.repeat === self.REPEAT_KEY.WEEKLY) {
                    var isChecked = 0, weekSummary = '';
                    summary += ' on ';
                    for (var i = 0; i < recurrence.repeatOn.length; i++) {

                        if (recurrence.repeatOn[i].checked) {
                            isChecked++;
                            weekSummary += recurrence.repeatOn[i].title + ', ';
                        }
                    }
                    if (isChecked == 7) weekSummary = 'all days';
                    else if (isChecked > 0)   weekSummary = weekSummary.replace(/,\s*$/, "");
                    else  weekSummary = date.week[today.getDay()];

                    summary += weekSummary;
                }

                else if (recurrence.repeat== self.REPEAT_KEY.MONTHLY) {

                    if (!recurrence.repeatBy)   summary += ' on day ' + recurrence.starts_on.getDate();
                    else {

                        summary += ' on the ' + date.weekPrefixes[recurrence.weekNumber] + ' ' + date.week[recurrence.starts_on.getDay()];
                    }
                }
                else if (recurrence.repeat == self.REPEAT_KEY.YEARLY) {
                    summary += ' on ' + date.month[recurrence.starts_on.getMonth()] + ' ' + recurrence.starts_on.getDate();
                }

                if(recurrence.starts_on.getHours() || recurrence.starts_on.getMinutes()) {
                    summary += ' @ ' +date.getTime(recurrence.starts_on);
                }

                if (recurrence.repeatEnd.id == 1 && recurrence.repeatEnd.occurrence) {
                    summary += ', ' + recurrence.repeatEnd.occurrence + ' times';
                }
                else if (recurrence.repeatEnd.id == 2 && recurrence.repeatEnd.end) {
                    summary += ' until ' + date.getDateTime(recurrence.repeatEnd.end);
                }

                return summary;
            }
            else if(recurrence.due_date){
                return date.getDateTime(recurrence.due_date);
            }
            else  return stringService.EMPTY;
        };

        self.setDueDate = function(recurrence, date_modified){

            if (!recurrence.isRecurring) return recurrence;

            var recurringIndex;
            recurrence.starts_on = new Date(recurrence.starts_on);
            recurrence.due_date = new Date(recurrence.due_date);

            var date;
            if (date_modified) {
                date = date_modified < recurrence.due_date ? new Date(recurrence.due_date) : new Date(date_modified);
                recurringIndex = recurrence.every;

            }
            else {
                //for initiate due date
                date = new Date(recurrence.starts_on);
                recurringIndex = 0;
            }

            switch (recurrence.repeat) {

                case self.REPEAT_KEY.DAILY:
                    date.setDate(date.getDate() + recurringIndex );
                    break;

                case self.REPEAT_KEY.WEEKLY:

                    var weekDate = new Date(date);
                    var weekDay;
                    var currentWeekExists = false;
                    weekDay = recurringIndex ?  7 : 14;
                    var currentDay = weekDate.getDay()+1;
                    weekDate.setDate(weekDate.getDate()+1);

                    while(currentDay < weekDay){

                        if(recurrence.repeatOn[weekDate.getDay()].checked) {
                            currentWeekExists = true;
                            date = weekDate;
                            break;
                        }
                        weekDate.setDate(weekDate.getDate()+1);
                        currentDay++;
                    }

                    if(!currentWeekExists){

                        var weekStart_date = new Date(date);
                        weekStart_date.setDate(weekStart_date.getDate() + 7*recurringIndex- weekStart_date.getDay());
                        for (i = 0; i < 7; i++) {
                            if (recurrence.repeatOn[weekStart_date.getDay()].checked) {
                                date = weekStart_date;
                                break;
                            }
                            weekStart_date.setDate(weekStart_date.getDate()+1);
                        }
                    }
                    break;

                case self.REPEAT_KEY.MONTHLY:
                    var nextMonth = date.getMonth() + 1*recurringIndex;
                    date.setMonth(nextMonth);
                    var start_date = new Date(recurrence.starts_on);
                    if(recurrence.repeatBy){

                        date.setDate(1);
                        for (var i = 0; i < 7; i++) {

                            if(date.getDay() == start_date.getDay()) break;
                            date.setDate(date.getDate()+1);
                        }
                        date.setDate(date.getDate()+recurrence.weekNumber*7);

                        if(date.getMonth() >nextMonth)   date.setDate(date.getDate()-7);

                    }
                    else date.setDate(start_date.getDate());

                    break;
                case self.REPEAT_KEY.YEARLY:
                    date.setFullYear(date.getFullYear() + 1*recurringIndex);
                    date.setDate(recurrence.starts_on.getDate());

            }
            //set Time
            date.setHours(recurrence.starts_on.getHours());
            date.setMinutes(recurrence.starts_on.getMinutes());

            return validateRecurring(date, recurrence,date_modified);
        };


    });
}).call(this);
