(function(){
    app.directive('clockPicker',['date',function(date){
        return {

            restrict:'EA',
            require:'ngModel',
            scope:{
                datetime:'=ngModel'
            },
            link:function(scope,ele,attr,ngModel){

                //var timeString=getTimeString(scope.datetime);
                $(ele).clockpicker({autoclose:false,donetext:'',appendTo:$(ele),placement:'none',stayOpen:true
                    ,change:function(changeValue){
                        console.log(changeValue);
                        var value=(changeValue+'').split(':');
                        var timeValue=date.getTimeFromString(changeValue);

                        ngModel.$setViewValue(timeValue);
                        //scope.datetime=timeValue;
                        console.log(timeValue);
                    }});

                ngModel.$render = function() {
                    var clockPicker=$(ele).data('clockpicker');
                    var timeString=date.getUnFormattedTimeString(ngModel.$modelValue);
                    clockPicker.setClock(timeString);

                };

            }
        };

    }]);
})();