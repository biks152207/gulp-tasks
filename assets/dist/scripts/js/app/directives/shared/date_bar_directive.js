(function() {
    app.directive('dateBar', ["date", function(date) {
        var definition;
        definition = {
            restrict: 'E',
           // require:'^ngModel',
            scope: {
                date: '=',
                previousDate: '=',
                index: '='
            },
            link: function(scope, element, attrs,ctrl) {
                window.dateBarDirectives=window.dateBarDirectives||0;
                window.dateBarDirectives++;
                //task.due = date.getDateOnly(task.recurrence.due_date) || new Date('01-01-2050');
                //task.recurrence.due_time = date.getTime(task.recurrence.due_date);
                //task.isOverdued = date.isPastDay(task.recurrence.due_date);
                //task.assignee = self.getAssignee(task);
                //tasks.push(task);
                function renderBar(val){
                    scope.hasDateBar = false;
                    var currentDate = new Date(isNumeric(scope.date)?parseFloat(scope.date):scope.date);
                    if(scope.previousDate){

                        var previousDate = new Date(isNumeric(scope.previousDate)?parseFloat(scope.previousDate):scope.previousDate);

                        if(currentDate.getDate() != previousDate.getDate() || currentDate.getMonth() != previousDate.getMonth() && currentDate.getFullYear() != previousDate.getFullYear()){
                            scope.hasDateBar = true;
                            scope.display = scope.date ? date.getMomentDate(currentDate) : 'No Date';
                        }
                    }
                    else if(scope.date || scope.index == 0){
                        scope.hasDateBar = true;
                        scope.display = scope.date ?  date.getMomentDate(currentDate) : 'No Date';
                    }

                    if(scope.display=="Invalid date"){
                        debugger;
                    }


                    if(scope.hasDateBar){
                        element[0].outerHTML ='<ion-item  class="item-divider item  date-bar">'+scope.display+'</ion-item>';
                    }
                    else{
                        element[0].outerHTML ='<div></div>';
                    }

                    scope.$on('$destroy',function(){
                       window.dateBarDirectives--;
                    });

                    return val;

                }
                //ctrl.$formatters.unshift(renderBar);


                renderBar();


            }
        };
        return definition;
    }]);

    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

}).call(this);
