(function(){app.service("date",["settingsService","stringService","moment","platformService",function(e,t,a,n){function r(e){return(e<10?"0":"")+e}var s=this;s.getDate=function(e){return"tomorrow"===e?s.tomorrow():"today"===e?s.today():"week"===e?s.nextWeek():"month"===e?s.nextMonth():e.setHours(0,0,0,0)},s.getDateOnly=function(e){return void 0==e||""==e?e:(e=new Date(e),e.setHours(0,0,0,0))},s.today=function(){return a().startOf("day")},s.tomorrow=function(){return a().add("days",1).startOf("day")},s.nextWeek=function(){return a().add("days",7).startOf("day")},s.nextMonth=function(){return a().add("months",1).startOf("day")},s.isToday=function(e){if(!e)return!1;e=new Date(e);var t=new Date;return e.getMonth()==t.getMonth()&&e.getFullYear()==t.getFullYear()&&e.getDate()==t.getDate()},s.isTomorrow=function(e){if(void 0==e||""==e)return!1;e=new Date(e);var t=new Date;return e.getMonth()==t.getMonth()&&e.getFullYear()==t.getFullYear()&&e.getDate()==t.getDate()+1},s.isYesterday=function(e){if(void 0==e||""==e)return!1;e=new Date(e);var t=new Date;return e.getMonth()==t.getMonth()&&e.getFullYear()==t.getFullYear()&&e.getDate()==t.getDate()-1},s.isInNextNDays=function(e,t){if(!e)return!1;e=new Date(e);var a=new Date;a.setHours(0,0,0,0);var n=new Date;return n.setDate(a.getDate()+t),n.setHours(0,0,0,0),e>=a&&e<n},s.isInNextNMonths=function(e,t){if(!e)return!1;e=new Date(e);var a=new Date;a.setHours(0,0,0,0);var n=new Date;return n.setMonth(a.getMonth()+t),n.setHours(0,0,0,0),e>=a&&e<=n},s.isInNextNYears=function(e,t){if(!e)return!1;e=new Date(e);var a=new Date;a.setHours(0,0,0,0);var n=new Date;return n.setFullYear(a.getFullYear()+t),n.setHours(0,0,0,0),e>=a&&e<=n},s.isInRange=function(e,t,n){var r=a.range(new Date(e),new Date(t));return r.contains(new Date(n))},s.isPastDay=function(e){if(void 0==e||""==e)return!1;e=new Date(e);var t=new Date;return!(s.isToday(e)&&!e.getHours()&&!e.getMinutes())&&e<t},s.updateSummary=function(e,t){var a=new Date;e.starts_on=new Date(e.starts_on);var n="";if(n=e.every<=1?e.repeat.type:"Every "+e.every+" "+e.repeat.title,2==e.repeat.id){var r=0,o="";n+=" on ";for(var i=0;i<t.length;i++)t[i].checked&&(r++,o+=t[i].title+", ");o=7==r?"all days":r>0?o.replace(/,\s*$/,""):s.week[a.getDay()],n+=o}else 3==e.repeat.id?n+=e.by?" on the "+s.weekPrefixes[e.weekNumber]+" "+s.week[e.starts_on.getDay()]:" on day "+e.starts_on.getDate():4==e.repeat.id&&(n+=" on "+s.month[e.starts_on.getMonth()]+" "+e.starts_on.getDate());return e.starts_on=new Date(e.starts_on),(e.starts_on.getHours()||e.starts_on.getMinutes())&&(n+=s.timeFormat(e.starts_on)),1==e.repeatEnd.id&&e.repeatEnd.occurrence?n+=", "+e.repeatEnd.occurrence+" times":2==e.repeatEnd.id&&e.repeatEnd.end&&(n+=" until "+s.dateTimeFormat(e.repeatEnd.end)),n},s.month=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],s.week=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],s.weekPrefixes=["First","Second","Third","Fourth","Fifth"],s.repeats=[{id:0,type:"No repeat",title:"No repeat"},{id:1,type:"Daily",title:"days"},{id:2,type:"Weekly",title:"weeks"},{id:3,type:"Monthly",title:"months"},{id:4,type:"Yearly",title:"years"}],s.repeatOnList=[{checked:!1,code:"S",title:"Sunday"},{checked:!1,code:"M",title:"Monday"},{checked:!1,code:"T",title:"Tuesday"},{checked:!1,code:"W",title:"Wednesday"},{checked:!1,code:"T",title:"Thursday"},{checked:!1,code:"F",title:"Friday"},{checked:!1,code:"S",title:"Saturday"}],s.repeatByList=[{checked:!1,code:0,name:"day of the month"},{checked:!1,code:1,name:"day of the week"}],s.TIME_FORMAT=["hh:mm A","HH:mm"],s.DATE_FORMAT=["DD MMM YYYY","MMM DD, YYYY"],s.getDateTime=function(n){var r=t.EMPTY;n=new Date(n);var o=s.DATE_FORMAT[parseInt(e.getSettings().date_format.value)];return(n.getHours()||n.getMinutes())&&(r=" @ "+s.TIME_FORMAT[parseInt(e.getSettings().time_format.value)]),a(n).calendar(null,{lastDay:"[Yesterday]"+r,sameDay:"[Today]"+r,nextDay:"[Tomorrow]"+r,nextWeek:o+r,lastWeek:o+r,sameElse:o+r})},s.getDateTimeFromNow=function(e){e=new Date(e);var t=new Date,n=t.getFullYear()!=e.getFullYear();return t.setDate(t.getDate()-1),a(e).diff(a(t))>1?a(e).fromNow(!0):n?a(e).format("D MMM YYYY"):a(e).format("D MMM")},s.getTime=function(n){n=new Date(n);var r=e.getSettings();if(r&&n.getHours()||n.getMinutes()){var o=s.TIME_FORMAT[parseInt(r.time_format.value)];return a(n).format(o)}return t.EMPTY},s.getMomentDate=function(t){var r=s.DATE_FORMAT[parseInt(e.getSettings().date_format.value)],o=a(new Date(t)),i=a().diff(o,"days");n.isMobileDevice();return o.year()===a().year()&&(r=r.replace(new RegExp("y","gi"),"")),r=r.replace("dd","d").replace("DD","D"),o.calendar(null,{lastDay:'[Yesterday] [&nbsp;<span class="date-value">]'+r+"[</span>]",sameDay:'[Today] [&nbsp;<span class="date-value">]'+r+"[</span>]",nextDay:'[Tomorrow] [&nbsp;<span class="date-value">]'+r+"[</span>]",nextWeek:'ddd [&nbsp;<span class="date-value">]'+r+"[</span>]",lastWeek:'[Last] dddd [&nbsp;<span class="date-value">]'+r+"[</span>]",sameElse:(i>0?"["+i+" days ago &nbsp;":"[")+'<span class="date-value '+(i>0?"previous-day":"future-day")+'">]'+r+"[</span>]"})},s.getDateGroupHeader=function(e){return e?s.getMomentDate(e):"No Date"},s.isPast=function(e){var t=a(new Date);return e=a(new Date(e)),t.diff(e)>0},s.isAfter=function(e,t){return e=a(new Date(e)),t=a(new Date(t)),e.diff(t)>1},s.getUnFormattedTimeString=function(e){var t=e,a=t?new Date(t):new Date;t||(a.setHours(0),a.setMinutes(0),a.setMinutes(0),a.setMilliseconds(0));var n=r(a.getHours())+":"+r(a.getMinutes());return n},s.getTimeFromString=function(e){var t=(e+"").split(":"),a=new Date;return t.length>1&&(a.setHours(t[0]),a.setMinutes(t[1]),a.setSeconds(0),a.setMilliseconds(0)),a}}])}).call(this);