(function(){
    app.filter('dueDateSummary',['dueService',function(dueService){
       return function(task){
           if(task && task.recurrence && task.recurrence){
                return dueService.getSummary(task.recurrence);
           }

       }
    }]);
})();