(function(){app.directive("notificationChannels",["userModel","stringService",function(n,e){return{restrict:"E",replace:!0,scope:{channels:"=",assignee:"="},template:"<span>{{channelList}}</span>",link:function(s,a,i){s.$watch("channels",function(){var a=[],i=n.getLoggedInId();s.channels.email.value&&a.push(s.channels.email.title),s.channels.push.value&&a.push(s.channels.push.title),a=a.join(", ");var t=a.lastIndexOf(",");t!=-1&&(a=a.substring(0,t)+" and "+a.substring(t+1)),a=a.replace(/, $/," and "),s.assignee?s.assignee._id!=i?s.channelList=e.EMPTY:s.channelList=a+": ":s.channelList=a})}}}])}).call(this);