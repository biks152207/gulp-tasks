

(function (factory) {
    'use strict';
    /* istanbul ignore if */
    if (typeof define === 'function' && /* istanbul ignore next */ define.amd) {
        define(['angular', 'moment'], factory); // AMD
        /* istanbul ignore next */
    } else if (typeof exports === 'object') {
        module.exports = factory(require('angular'), require('moment')); // CommonJS
    } else {
        factory(window.angular, window.moment); // Browser global
    }
}(function (angular, moment) {
    'use strict';
    angular.module('ui.bootstrap.datetimepicker', [])
        .constant('dateTimePickerConfig', {
            dropdownSelector: null,
            minView: 'day',
            startView: 'day'
        })
        .directive('datetimepicker', ['$log', 'dateTimePickerConfig', 'settingsService', function datetimepickerDirective($log, defaultConfig, settingsService) {

            function DateObject() {

                var tempDate = new Date();
                this.utcDateValue = tempDate.getTime();
                this.selectable = true;

                this.localDateValue = function () {
                    return this.utcDateValue + localOffset;
                };

                var validProperties = ['utcDateValue', 'localDateValue', 'display', 'active','today', 'selectable', 'past', 'future'];

                for (var prop in arguments[0]) {
                    /* istanbul ignore else */
                    //noinspection JSUnfilteredForInLoop
                    if (validProperties.indexOf(prop) >= 0) {
                        //noinspection JSUnfilteredForInLoop
                        this[prop] = arguments[0][prop];
                    }
                }

            }

            var validateConfiguration = function validateConfiguration(configuration) {
                var validOptions = ['startView', 'minView', 'minuteStep', 'dropdownSelector'];

                for (var prop in configuration) {
                    //noinspection JSUnfilteredForInLoop
                    if (validOptions.indexOf(prop) < 0) {
                        throw ('invalid option: ' + prop);
                    }
                }

                // Order of the elements in the validViews array is significant.
                var validViews = ['day', 'month', 'year'];

                if (validViews.indexOf(configuration.startView) < 0) {
                    throw ('invalid startView value: ' + configuration.startView);
                }

                if (validViews.indexOf(configuration.minView) < 0) {
                    throw ('invalid minView value: ' + configuration.minView);
                }

                if (validViews.indexOf(configuration.minView) > validViews.indexOf(configuration.startView)) {
                    throw ('startView must be greater than minView');
                }

                if (configuration.dropdownSelector !== null && !angular.isString(configuration.dropdownSelector)) {
                    throw ('dropdownSelector must be a string');
                }

                /* istanbul ignore next */
                if (configuration.dropdownSelector !== null && ((typeof jQuery === 'undefined') || (typeof jQuery().dropdown !== 'function'))) {
                    $log.error('Please DO NOT specify the dropdownSelector option unless you are using jQuery AND Bootstrap.js. ' +
                        'Please include jQuery AND Bootstrap.js, or write code to close the dropdown in the on-set-time callback. \n\n' +
                        'The dropdownSelector configuration option is being removed because it will not function properly.');
                    delete configuration.dropdownSelector;
                }
            };

            return {
                restrict: 'E',
                require: 'ngModel',
                template: '<div class="datetimepicker table-responsive">' +
                '<table class="table table-striped  {{ data.currentView }}-view">' +
                '   <thead>' +
                '       <tr>' +
                '           <th class="left-arrow" data-ng-click="changeView(data.currentView, data.leftDate, $event)" data-ng-show="data.leftDate.selectable"><i class="tdzicon-back"/></th>' +
                '           <th class="switch" colspan="5" data-ng-show="data.previousViewDate.selectable" data-ng-click="changeView(data.previousView, data.previousViewDate, $event)">{{ data.previousViewDate.display }}</th>' +
                '           <th class="right-arrow" data-ng-click="changeView(data.currentView, data.rightDate, $event)" data-ng-show="data.rightDate.selectable"><i class="tdzicon-forward"/></th>' +
                '       </tr>' +
                '       <tr>' +
                '           <th class="dow" data-ng-repeat="day in data.dayNames" >{{ day }}</th>' +
                '       </tr>' +
                '   </thead>' +
                '   <tbody>' +
                '       <tr data-ng-if="data.currentView !== \'day\'" >' +
                '           <td colspan="7" >' +
                '              <span    class="{{ data.currentView }}" ' +
                '                       data-ng-repeat="dateObject in data.dates"  ' +
                '                       data-ng-class="{active: dateObject.active, past: dateObject.past, future: dateObject.future, disabled: !dateObject.selectable}" ' +
                '                       data-ng-click="changeView(data.nextView, dateObject, $event)">{{ dateObject.display }}</span> ' +
                '           </td>' +
                '       </tr>' +
                '       <tr data-ng-if="data.currentView === \'day\'" data-ng-repeat="week in data.weeks">' +
                '           <td data-ng-repeat="dateObject in week.dates" ' +
                '               data-ng-click="changeView(data.nextView, dateObject, $event)"' +
                '               class="day" ' +
                '               data-ng-class="{active: dateObject.active,today: dateObject.today ,past: dateObject.past, future: dateObject.future, disabled: !dateObject.selectable}" >{{ dateObject.display }}</td>' +
                '       </tr>' +
                '   </tbody>' +
                '</table></div>',
                scope: {
                    onSetTime: '&',
                    beforeRender: '&'
                },
                replace: true,
                link: function link(scope, element, attrs, ngModelController) {

                    var directiveConfig = {};

                    if (attrs.datetimepickerConfig) {
                        directiveConfig = scope.$parent.$eval(attrs.datetimepickerConfig);
                    }

                    var configuration = {};

                    angular.extend(configuration, defaultConfig, directiveConfig);

                    validateConfiguration(configuration);

                    var startOfDecade = function startOfDecade(unixDate) {
                        var startYear = (parseInt(moment.utc(unixDate).year() / 10, 10) * 10);
                        return moment.utc(unixDate).year(startYear).startOf('year');
                    };

                    var dataFactory = {
                        year: function year(unixDate) {
                            var selectedDate = moment.utc(unixDate).startOf('year');
                            // View starts one year before the decade starts and ends one year after the decade ends
                            // i.e. passing in a date of 1/1/2013 will give a range of 2009 to 2020
                            // Truncate the last digit from the current year and subtract 1 to get the start of the decade
                            var startDecade = (parseInt(selectedDate.year() / 10, 10) * 10);
                            var startDate = moment.utc(startOfDecade(unixDate)).subtract(1, 'year').startOf('year');

                            var activeYear = ngModelController.$modelValue ? moment(ngModelController.$modelValue).year() : 0;

                            var result = {
                                'currentView': 'year',
                                'nextView': configuration.minView === 'year' ? 'setTime' : 'month',
                                'previousViewDate': new DateObject({
                                    utcDateValue: null,
                                    display: startDecade + '-' + (startDecade + 9)
                                }),
                                'leftDate': new DateObject({utcDateValue: moment.utc(startDate).subtract(9, 'year').valueOf()}),
                                'rightDate': new DateObject({utcDateValue: moment.utc(startDate).add(11, 'year').valueOf()}),
                                'dates': []
                            };

                            for (var i = 0; i < 12; i += 1) {
                                var yearMoment = moment.utc(startDate).add(i, 'years');
                                var dateValue = {
                                    'utcDateValue': yearMoment.valueOf(),
                                    'display': yearMoment.format('YYYY'),
                                    'past': yearMoment.year() < startDecade,
                                    'future': yearMoment.year() > startDecade + 9,
                                    'active': yearMoment.year() === activeYear
                                };

                                result.dates.push(new DateObject(dateValue));
                            }

                            return result;
                        },

                        month: function month(unixDate) {

                            var startDate = moment.utc(unixDate).startOf('year');
                            var previousViewDate = startOfDecade(unixDate);
                            var activeDate = ngModelController.$modelValue ? moment(ngModelController.$modelValue).format('YYYY-MMM') : 0;

                            var result = {
                                'previousView': 'year',
                                'currentView': 'month',
                                'nextView': configuration.minView === 'month' ? 'setTime' : 'day',
                                'previousViewDate': new DateObject({
                                    utcDateValue: previousViewDate.valueOf(),
                                    display: startDate.format('YYYY')
                                }),
                                'leftDate': new DateObject({utcDateValue: moment.utc(startDate).subtract(1, 'year').valueOf()}),
                                'rightDate': new DateObject({utcDateValue: moment.utc(startDate).add(1, 'year').valueOf()}),
                                'dates': []
                            };

                            for (var i = 0; i < 12; i += 1) {
                                var monthMoment = moment.utc(startDate).add(i, 'months');
                                var dateValue = {
                                    'utcDateValue': monthMoment.valueOf(),
                                    'display': monthMoment.format('MMM'),
                                    'active': monthMoment.format('YYYY-MMM') === activeDate
                                };

                                result.dates.push(new DateObject(dateValue));
                            }

                            return result;
                        },

                        day: function day(unixDate) {

                            var selectedDate = moment.utc(unixDate);
                            var startOfMonth = moment.utc(selectedDate).startOf('month');
                            var previousViewDate = moment.utc(selectedDate).startOf('year');
                            var endOfMonth = moment.utc(selectedDate).endOf('month');


                            //change by Farhad  to start the calendar with respect to Setting's Start Day
                            var startDay = parseInt(settingsService.getSettings().start_day.value);
                            var StartOfMonthDay = startOfMonth.day();
                            var numberOfDayInWeek =7;
                            var weekDay = startDay > StartOfMonthDay ? (numberOfDayInWeek+StartOfMonthDay -startDay) : (StartOfMonthDay -startDay);
                            var startDate = moment.utc(startOfMonth).subtract(Math.abs(weekDay), 'days');

                            var activeDate = ngModelController.$modelValue ? moment(ngModelController.$modelValue).format('YYYY-MMM-DD') : '';
                            var today = moment().format('YYYY-MMM-DD');


                            var result = {
                                'previousView': 'month',
                                'currentView': 'day',
                                'nextView':  'setTime',
                                'previousViewDate': new DateObject({
                                    utcDateValue: previousViewDate.valueOf(),
                                    display: startOfMonth.format('MMMM - YYYY')
                                }),
                                'leftDate': new DateObject({utcDateValue: moment.utc(startOfMonth).subtract(1, 'months').valueOf()}),
                                'rightDate': new DateObject({utcDateValue: moment.utc(startOfMonth).add(1, 'months').valueOf()}),
                                'dayNames': [],
                                'weeks': []
                            };

                            //change by Farhad  to start the calendar with respect to Setting's Start Day
                           for (var dayNumber = 0; dayNumber < 7; dayNumber += 1) {
                                result.dayNames.push(moment.utc().weekday((startDay+dayNumber)%numberOfDayInWeek).format('dd'));
                            }

                            for (var i = 0; i < 6; i += 1) {
                                var week = {dates: []};

                                for (var j = 0; j < 7; j += 1) {

                                    var monthMoment = moment.utc(startDate).add((i* 7) + j, 'days');
                                    var dateValue = {
                                        'utcDateValue': monthMoment.valueOf(),
                                        'display': monthMoment.format('D'),
                                        'active': monthMoment.format('YYYY-MMM-DD') === activeDate,
                                        'today': monthMoment.format('YYYY-MMM-DD') === today,
                                        'past': monthMoment.isBefore(startOfMonth),
                                        'future': monthMoment.isAfter(endOfMonth)
                                    };
                                    week.dates.push(new DateObject(dateValue));
                                }
                                result.weeks.push(week);
                            }

                            return result;
                        },

                        setTime: function setTime(unixDate) {
                            var tempDate = new Date(unixDate);
                            var newDate = new Date(tempDate.getTime() + (tempDate.getTimezoneOffset() * 60000));

                            var oldDate = ngModelController.$modelValue;
                            ngModelController.$setViewValue(newDate);

                            if (configuration.dropdownSelector) {
                                jQuery(configuration.dropdownSelector).dropdown('toggle');
                            }

                            scope.onSetTime({newDate: newDate, oldDate: oldDate});

                            return dataFactory[configuration.startView](unixDate);
                        }
                    };

                    var getUTCTime = function getUTCTime(modelValue) {
                        var tempDate = (modelValue ? moment(modelValue).toDate() : new Date());
                        return tempDate.getTime() - (tempDate.getTimezoneOffset() * 60000);
                    };

                    scope.changeView = function changeView(viewName, dateObject, event) {
                        if (event) {
                            event.stopPropagation();
                            event.preventDefault();
                        }


                        if (viewName && (dateObject.utcDateValue > -Infinity) && dateObject.selectable && dataFactory[viewName]) {
                            var result = dataFactory[viewName](dateObject.utcDateValue);

                            var weekDates = [];
                            if (result.weeks) {
                                for (var i = 0; i < result.weeks.length; i += 1) {
                                    var week = result.weeks[i];
                                    for (var j = 0; j < week.dates.length; j += 1) {
                                        var weekDate = week.dates[j];
                                        weekDates.push(weekDate);
                                    }
                                }
                            }

                            scope.beforeRender({
                                $view: result.currentView,
                                $dates: result.dates || weekDates,
                                $leftDate: result.leftDate,
                                $upDate: result.previousViewDate,
                                $rightDate: result.rightDate
                            });

                            scope.data = result;
                        }
                    };

                    ngModelController.$render = function $render() {
                        scope.changeView(configuration.startView, new DateObject({utcDateValue: getUTCTime(ngModelController.$viewValue)}));
                    };
                }
            };
        }]);
}));