(function(){
    app.service('uiHelperService',['$timeout',function($timeout){
        var self=this;
        window.uiLog=[];
        self.focusTo=function(id,$ionicScrollDelegate,opt){
            window.uiLog.push('id : '+id);
            opt=$.extend({
                offsetTop:0,
                offsetLeft:0

            },opt);

            if(id===undefined) return;
            //var parentView=window.document.body;
            var ele=self.scrollTo(id,$ionicScrollDelegate,opt,function(){
                window.uiLog.push('in callback');
                var backgroundElement=$('#'+id);
                if(opt.focusMeBackgroundSelector){
                    backgroundElement=$(opt.focusMeBackgroundSelector,ele);
                }
                if(backgroundElement.length==0){
                    backgroundElement=ele;
                }
                $timeout(function(){
                    backgroundElement.animate({backgroundColor:'#e5eff7'},"fast")
                        .animate({backgroundColor:'none'},"fast")
                        .animate({backgroundColor:'#e5eff7'},"fast")
                        .animate({backgroundColor:'none'},"fast")
                        .promise().then(function(){
                            console.log('animation complete');
                            window.uiLog.push('animation complete');
                            //console.log(ele);

                        });
                });
            });

            if(ele.length>0 ){
                return;

            }
            else{
                console.log('element with id '+id+'not found');
            }

        };


        self.scrollTo=function(id,$ionicScrollDelegate,opt,callback) {
            opt=$.extend({
                offsetTop:0,
                offsetLeft:0

            },opt);

            if(id===undefined) return;
            var parentView=window.document.body;
            var ele=$('#'+id,parentView);
            if(ele.length>0 ) {
                startScrolling();

            }
            else{
                window.uiLog.push('element not found to scroll to . going for timeout');
                $timeout(function(){
                    parentView=window.document.body;
                    ele=$('#'+id,parentView);
                    startScrolling();
                },2000);
            }

            function startScrolling(){
                if(ele.length>0 ) {
                    var scrollingThrottle=ionic.debounce(scrollNow,800);
                    var images=$('img',parentView);
                    console.log('has images: '+images.length);
                    scrollingThrottle();

                    if(images.length>0){

                        $(images).on('load',function(){
                            console.log('load event called in scrollTo');
                            window.uiLog.push('load event called in scrollTo');
                            scrollingThrottle();
                        });
                    }


                    function scrollNow(){
                        console.log('scrolling now');
                        window.uiLog.push('scrolling now');
                        parentView=window.document.body;
                        ele=$('#'+id,parentView);

                        var pos = ele.offset();
                        var scrollViewParent=ele.parents('.scroll');


                        var top = pos.top;
                        var left = pos.left;
                        if(scrollViewParent.length>0){
                            var scrollViewPos=$(scrollViewParent.get(0)).offset();
                            top=Math.abs(top-scrollViewPos.top);
                            left=Math.abs(left-scrollViewPos.left);
                        }
                        //var viewPos=$ionicScrollDelegate.getScrollPosition();
                        //top+=viewPos.top;

                        if (opt.offsetTop) {
                            top -= parseInt(opt.offsetTop);
                        }
                        if (opt.offsetLeft) {
                            left -= parseInt(opt.offsetLeft);
                        }


                        $ionicScrollDelegate.scrollTo(left, top);
                        if(callback){
                            window.uiLog.push('calling callback');
                            $timeout(callback);
                        }
                    }

                    //return ele;

                }
                else{

                }

            }

            return ele;


        };


    }]);
})();