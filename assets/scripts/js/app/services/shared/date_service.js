(function () {
    app.service('date', function (settingsService, stringService, moment,platformService) {

        var self = this;

        self.getDate = function (value) {

            if (value === 'tomorrow') return self.tomorrow();
            else if (value === 'today') return self.today();
            else if (value === 'week') return self.nextWeek();
            else if (value === 'month') return self.nextMonth();
            return value.setHours(0, 0, 0, 0);
        };

        self.getDateOnly = function(date){

            if (date == undefined || date == '') return date;
            date = new Date(date);
            return date.setHours(0,0,0,0);
        };


        self.today = function () {

            return moment().startOf("day");

        };

        self.tomorrow = function () {

            return moment().add('days', 1).startOf("day");
        };

        self.nextWeek = function () {

            return moment().add('days', 7).startOf("day");

        };

        self.nextMonth = function () {

            return moment().add('months', 1).startOf("day");
        };


        self.isToday = function (date) {

            if (!date) return false;
            date = new Date(date);
            var today = new Date();

            return (date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear() && date.getDate() == today.getDate());
        };

        self.isTomorrow = function (date) {

            if (date == undefined || date == '') return false;
            date = new Date(date);
            var today = new Date();

            return (date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear() && date.getDate() == today.getDate()+1);
        };

        self.isYesterday = function (date) {

            if (date == undefined || date == '') return false;
            date = new Date(date);
            var today = new Date();

            return (date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear() && date.getDate() == today.getDate()-1);
        };

        self.isInNextNDays = function (date, n) {

            if (!date) return false;
            date = new Date(date);
            var from = new Date();
            from.setHours(0, 0, 0, 0);
            var to = new Date();
            to.setDate(from.getDate()+n);
            to.setHours(0, 0, 0, 0);
            return (date >= from && date<to);
        };

        self.isInNextNMonths = function (date, n) {

            if (!date) return false;
            date = new Date(date);
            var from = new Date();
            from.setHours(0, 0, 0, 0);
            var to = new Date();
            to.setMonth(from.getMonth()+n);
            to.setHours(0, 0, 0, 0);

            return (date >= from && date<=to);
        };

        self.isInNextNYears = function (date, n) {

            if (!date) return false;
            date = new Date(date);
            var from = new Date();
            from.setHours(0, 0, 0, 0);
            var to = new Date();
            to.setFullYear(from.getFullYear()+n);
            to.setHours(0, 0, 0, 0);

            return (date >= from && date<=to);
        };

        self.isInRange = function(startDate, endDate, date){

            var range = moment.range(new Date(startDate), new Date(endDate));
            return range.contains(new Date(date));
        };

        self.isPastDay = function (date) {

            if (date == undefined || date == '') return false;
            date = new Date(date);
            var today = new Date();

            //for today without time does not consider as past day
            if(self.isToday(date) && !date.getHours() && !date.getMinutes()) return false;

            return date<today ;
        };


        self.updateSummary = function(recurrence, repeatOnList){
            var today = new Date();
            recurrence.starts_on = new Date(recurrence.starts_on);

            var summary = '';
            if (recurrence.every <= 1) summary = recurrence.repeat.type;
            else summary = 'Every ' + recurrence.every + ' ' + recurrence.repeat.title;


            if (recurrence.repeat.id == 2) {
                var ischecked = 0, weekSummary = '';
                summary += ' on ';
                for (var i = 0; i < repeatOnList.length; i++) {

                    if (repeatOnList[i].checked) {
                        ischecked++;
                        weekSummary += repeatOnList[i].title + ', ';
                    }
                }
                if (ischecked == 7) weekSummary = 'all days';
                else if (ischecked > 0)   weekSummary = weekSummary.replace(/,\s*$/, "");
                else  weekSummary = self.week[today.getDay()];

              summary += weekSummary;
            }

            else if (recurrence.repeat.id == 3) {

                if (!recurrence.by)   summary += ' on day ' + recurrence.starts_on.getDate();
                else {
                    summary += ' on the ' + self.weekPrefixes[recurrence.weekNumber] + ' ' + self.week[recurrence.starts_on.getDay()];
                }
            }
            else if (recurrence.repeat.id == 4) {
                summary += ' on ' + self.month[recurrence.starts_on.getMonth()] + ' ' + recurrence.starts_on.getDate();
            }

            recurrence.starts_on = new Date(recurrence.starts_on);
            if(recurrence.starts_on.getHours() || recurrence.starts_on.getMinutes()) {
                summary += self.timeFormat(recurrence.starts_on);
            }

            if (recurrence.repeatEnd.id == 1 && recurrence.repeatEnd.occurrence) {
                summary += ', ' + recurrence.repeatEnd.occurrence + ' times';
            }
            else if (recurrence.repeatEnd.id == 2 && recurrence.repeatEnd.end) {
                summary += ' until ' + self.dateTimeFormat(recurrence.repeatEnd.end);
            }

            return summary;
        };

        self.month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        self.week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        self.weekPrefixes = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];

        self.repeats = [{id: 0, type: 'No repeat', title: 'No repeat'},
            {id: 1, type: 'Daily', title: 'days'},
            {id: 2, type: 'Weekly', title: 'weeks'},
            {id: 3, type: 'Monthly', title: 'months'},
            {id: 4, type: 'Yearly', title: 'years'}];

        self.repeatOnList = [ {checked: false, code: 'S', title: 'Sunday'},
            {checked: false, code: 'M', title: 'Monday'},
            {checked: false, code: 'T', title: 'Tuesday'},
            {checked: false, code: 'W', title: 'Wednesday'},
            {checked: false, code: 'T', title: 'Thursday'},
            {checked: false, code: 'F', title: 'Friday'},
            {checked: false, code: 'S', title: 'Saturday'}];

        self.repeatByList = [{checked: false, code: 0, name: "day of the month"},
            {checked: false, code: 1, name: "day of the week"}];


        //CODE USING MOMENTJS-NEW VERSION

        self.TIME_FORMAT = [
            'hh:mm A',
            'HH:mm'
        ];


        self.DATE_FORMAT = [
            'DD MMM YYYY',
            'MMM DD, YYYY'
        ];

        self.getDateTime = function(date){

            var timeFormat = stringService.EMPTY;
            date = new Date(date);
            var dateFormat = self.DATE_FORMAT[parseInt(settingsService.getSettings().date_format.value)];
            if(date.getHours() || date.getMinutes()){
                timeFormat = ' @ ' +self.TIME_FORMAT[parseInt(settingsService.getSettings().time_format.value)];
            }

            return moment(date).calendar(null, {
                lastDay:'[Yesterday]'+timeFormat,
                sameDay: '[Today]'+timeFormat,
                nextDay: '[Tomorrow]'+timeFormat,
                nextWeek: dateFormat+timeFormat,
                lastWeek: dateFormat+timeFormat,
                sameElse: dateFormat+timeFormat
            });
        };

        self.getDateTimeFromNow = function(date){

            date = new Date(date);
            var last = new Date();
            var isLastYear = last.getFullYear() != date.getFullYear();
            last.setDate(last.getDate()-1);
            if(moment(date).diff(moment(last)) > 1){
                return moment(date).fromNow(true);
            }
            else if(isLastYear){
                return moment(date).format("D MMM YYYY");
            }
            return moment(date).format("D MMM");
        };

        self.getTime = function(date){
            date = new Date(date);
            var settings=settingsService.getSettings();
            if(settings && date.getHours() || date.getMinutes()){
                var timeFormat = self.TIME_FORMAT[parseInt(settings.time_format.value)];
                return moment(date).format(timeFormat);
            }
           return stringService.EMPTY;

        };

        self.getMomentDate = function(date){
            var format = self.DATE_FORMAT[parseInt(settingsService.getSettings().date_format.value)];
            var m=moment(new Date(date));
            var diffDays= moment().diff(m,"days");
            var isMobile=platformService.isMobileDevice();

            if(m.year()===moment().year()){
                format=format.replace(new RegExp("y","gi"),"");
            }
            format=format.replace("dd","d").replace("DD","D");

            return m.calendar(null, {
                lastDay:'[Yesterday] '+'[&nbsp;<span class="date-value">]'+format+'[</span>]',
                sameDay: '[Today] '+'[&nbsp;<span class="date-value">]'+format+'[</span>]',
                nextDay: '[Tomorrow] '+'[&nbsp;<span class="date-value">]'+format+'[</span>]',
                nextWeek: 'ddd '+'[&nbsp;<span class="date-value">]'+format+'[</span>]',
                lastWeek: '[Last] dddd '+'[&nbsp;<span class="date-value">]'+format+'[</span>]',
                sameElse: (diffDays>0?'['+diffDays+' days ago &nbsp;':'[')+'<span class="date-value '+(diffDays>0?'previous-day':'future-day')+'">]'+format+'[</span>]'
            });
        };

        self.getDateGroupHeader=function(due_date){
            return due_date ? self.getMomentDate(due_date) : 'No Date';
        };

        self.isPast = function(date){
          var current = moment(new Date());
            date = moment(new Date(date));
            return current.diff(date) > 0 ;
        };

        self.isAfter = function(date, comparedDate){
            date = moment(new Date(date));
            comparedDate = moment(new Date(comparedDate));
            return date.diff(comparedDate) > 1;
        };

        self.getUnFormattedTimeString=function(datetime){
            var existingTimeValue=datetime;
            var defaultTimeValue=existingTimeValue?new Date(existingTimeValue):new Date()
            if(!existingTimeValue){
                defaultTimeValue.setHours(0);
                defaultTimeValue.setMinutes(0);
                defaultTimeValue.setMinutes(0);
                defaultTimeValue.setMilliseconds(0);
            }

            var timeString=leadingZero(defaultTimeValue.getHours())+':'+leadingZero(defaultTimeValue.getMinutes());
            return timeString;
        }

        self.getTimeFromString=function(str){
            var value=(str+'').split(':');
            var timeValue=new Date();
            if(value.length>1){
                timeValue.setHours(value[0]);
                timeValue.setMinutes(value[1]);
                timeValue.setSeconds(0);
                timeValue.setMilliseconds(0);
            }

            return timeValue;
        }

        function leadingZero(num) {
            return (num < 10 ? '0' : '') + num;
        }



    });
}).call(this);
