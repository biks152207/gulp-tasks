/**
 * Created by skyestreamptyltd on 6/7/16.
 */
(function(){
    app.directive('fixShiftKey',[function(){
        return {
            restrict:'A',
            link:function(scope,ele,attr){

                $(window).on('keydown',handleKeyDown);
                $(window).on('keyup',handleKeyUp);

                function handleKeyDown(e){
                    if(e.keyCode==16)
                    {
                        window.fixes=window.fixes||{};
                        window.fixes.shiftKey=true;
                    }
                }

                function handleKeyUp(e){
                    if(e.keyCode==16 && window.fixes){
                        delete window.fixes.shiftKey;
                        //window.fixes.shiftKey=false;
                    }
                }
            }
        }
    }]);
})();