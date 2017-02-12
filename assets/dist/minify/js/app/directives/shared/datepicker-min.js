!function(e){"use strict";"function"==typeof define&&define.amd?define(["angular","moment"],e):"object"==typeof exports?module.exports=e(require("angular"),require("moment")):e(window.angular,window.moment)}(function(e,t){"use strict";e.module("ui.bootstrap.datetimepicker",[]).constant("dateTimePickerConfig",{dropdownSelector:null,minView:"day",startView:"day"}).directive("datetimepicker",["$log","dateTimePickerConfig","settingsService",function(a,r,i){function n(){var e=new Date;this.utcDateValue=e.getTime(),this.selectable=!0,this.localDateValue=function(){return this.utcDateValue+localOffset};var t=["utcDateValue","localDateValue","display","active","today","selectable","past","future"];for(var a in arguments[0])t.indexOf(a)>=0&&(this[a]=arguments[0][a])}var d=function(t){var r=["startView","minView","minuteStep","dropdownSelector"];for(var i in t)if(r.indexOf(i)<0)throw"invalid option: "+i;var n=["day","month","year"];if(n.indexOf(t.startView)<0)throw"invalid startView value: "+t.startView;if(n.indexOf(t.minView)<0)throw"invalid minView value: "+t.minView;if(n.indexOf(t.minView)>n.indexOf(t.startView))throw"startView must be greater than minView";if(null!==t.dropdownSelector&&!e.isString(t.dropdownSelector))throw"dropdownSelector must be a string";null===t.dropdownSelector||"undefined"!=typeof jQuery&&"function"==typeof jQuery().dropdown||(a.error("Please DO NOT specify the dropdownSelector option unless you are using jQuery AND Bootstrap.js. Please include jQuery AND Bootstrap.js, or write code to close the dropdown in the on-set-time callback. \n\nThe dropdownSelector configuration option is being removed because it will not function properly."),delete t.dropdownSelector)};return{restrict:"E",require:"ngModel",template:'<div class="datetimepicker table-responsive"><table class="table table-striped  {{ data.currentView }}-view">   <thead>       <tr>           <th class="left-arrow" data-ng-click="changeView(data.currentView, data.leftDate, $event)" data-ng-show="data.leftDate.selectable"><i class="tdzicon-back"/></th>           <th class="switch" colspan="5" data-ng-show="data.previousViewDate.selectable" data-ng-click="changeView(data.previousView, data.previousViewDate, $event)">{{ data.previousViewDate.display }}</th>           <th class="right-arrow" data-ng-click="changeView(data.currentView, data.rightDate, $event)" data-ng-show="data.rightDate.selectable"><i class="tdzicon-forward"/></th>       </tr>       <tr>           <th class="dow" data-ng-repeat="day in data.dayNames" >{{ day }}</th>       </tr>   </thead>   <tbody>       <tr data-ng-if="data.currentView !== \'day\'" >           <td colspan="7" >              <span    class="{{ data.currentView }}"                        data-ng-repeat="dateObject in data.dates"                         data-ng-class="{active: dateObject.active, past: dateObject.past, future: dateObject.future, disabled: !dateObject.selectable}"                        data-ng-click="changeView(data.nextView, dateObject, $event)">{{ dateObject.display }}</span>            </td>       </tr>       <tr data-ng-if="data.currentView === \'day\'" data-ng-repeat="week in data.weeks">           <td data-ng-repeat="dateObject in week.dates"                data-ng-click="changeView(data.nextView, dateObject, $event)"               class="day"                data-ng-class="{active: dateObject.active,today: dateObject.today ,past: dateObject.past, future: dateObject.future, disabled: !dateObject.selectable}" >{{ dateObject.display }}</td>       </tr>   </tbody></table></div>',scope:{onSetTime:"&",beforeRender:"&"},replace:!0,link:function(a,o,u,s){var c={};u.datetimepickerConfig&&(c=a.$parent.$eval(u.datetimepickerConfig));var l={};e.extend(l,r,c),d(l);var w=function(e){var a=10*parseInt(t.utc(e).year()/10,10);return t.utc(e).year(a).startOf("year")},f={year:function(e){for(var a=t.utc(e).startOf("year"),r=10*parseInt(a.year()/10,10),i=t.utc(w(e)).subtract(1,"year").startOf("year"),d=s.$modelValue?t(s.$modelValue).year():0,o={currentView:"year",nextView:"year"===l.minView?"setTime":"month",previousViewDate:new n({utcDateValue:null,display:r+"-"+(r+9)}),leftDate:new n({utcDateValue:t.utc(i).subtract(9,"year").valueOf()}),rightDate:new n({utcDateValue:t.utc(i).add(11,"year").valueOf()}),dates:[]},u=0;u<12;u+=1){var c=t.utc(i).add(u,"years"),f={utcDateValue:c.valueOf(),display:c.format("YYYY"),past:c.year()<r,future:c.year()>r+9,active:c.year()===d};o.dates.push(new n(f))}return o},month:function(e){for(var a=t.utc(e).startOf("year"),r=w(e),i=s.$modelValue?t(s.$modelValue).format("YYYY-MMM"):0,d={previousView:"year",currentView:"month",nextView:"month"===l.minView?"setTime":"day",previousViewDate:new n({utcDateValue:r.valueOf(),display:a.format("YYYY")}),leftDate:new n({utcDateValue:t.utc(a).subtract(1,"year").valueOf()}),rightDate:new n({utcDateValue:t.utc(a).add(1,"year").valueOf()}),dates:[]},o=0;o<12;o+=1){var u=t.utc(a).add(o,"months"),c={utcDateValue:u.valueOf(),display:u.format("MMM"),active:u.format("YYYY-MMM")===i};d.dates.push(new n(c))}return d},day:function(e){for(var a=t.utc(e),r=t.utc(a).startOf("month"),d=t.utc(a).startOf("year"),o=t.utc(a).endOf("month"),u=parseInt(i.getSettings().start_day.value),c=r.day(),l=7,w=u>c?l+c-u:c-u,f=t.utc(r).subtract(Math.abs(w),"days"),p=s.$modelValue?t(s.$modelValue).format("YYYY-MMM-DD"):"",V=t().format("YYYY-MMM-DD"),v={previousView:"month",currentView:"day",nextView:"setTime",previousViewDate:new n({utcDateValue:d.valueOf(),display:r.format("MMMM - YYYY")}),leftDate:new n({utcDateValue:t.utc(r).subtract(1,"months").valueOf()}),rightDate:new n({utcDateValue:t.utc(r).add(1,"months").valueOf()}),dayNames:[],weeks:[]},m=0;m<7;m+=1)v.dayNames.push(t.utc().weekday((u+m)%l).format("dd"));for(var y=0;y<6;y+=1){for(var h={dates:[]},D=0;D<7;D+=1){var g=t.utc(f).add(7*y+D,"days"),b={utcDateValue:g.valueOf(),display:g.format("D"),active:g.format("YYYY-MMM-DD")===p,today:g.format("YYYY-MMM-DD")===V,past:g.isBefore(r),future:g.isAfter(o)};h.dates.push(new n(b))}v.weeks.push(h)}return v},setTime:function(e){var t=new Date(e),r=new Date(t.getTime()+6e4*t.getTimezoneOffset()),i=s.$modelValue;return s.$setViewValue(r),l.dropdownSelector&&jQuery(l.dropdownSelector).dropdown("toggle"),a.onSetTime({newDate:r,oldDate:i}),f[l.startView](e)}},p=function(e){var a=e?t(e).toDate():new Date;return a.getTime()-6e4*a.getTimezoneOffset()};a.changeView=function(e,t,r){if(r&&(r.stopPropagation(),r.preventDefault()),e&&t.utcDateValue>-(1/0)&&t.selectable&&f[e]){var i=f[e](t.utcDateValue),n=[];if(i.weeks)for(var d=0;d<i.weeks.length;d+=1)for(var o=i.weeks[d],u=0;u<o.dates.length;u+=1){var s=o.dates[u];n.push(s)}a.beforeRender({$view:i.currentView,$dates:i.dates||n,$leftDate:i.leftDate,$upDate:i.previousViewDate,$rightDate:i.rightDate}),a.data=i}},s.$render=function(){a.changeView(l.startView,new n({utcDateValue:p(s.$viewValue)}))}}}}])});