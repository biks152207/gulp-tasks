
(function(){
    app.service('asyncStackService',['$q',function($q){
        var self=this;
        function stacker(){
            var self=this;
            var funcs=[];
            var currentWrapper=null;

            function asyncWrapper(asyncFunc,params, ctx,bucket){
                var myAsyncFunc=asyncFunc;
                var myParams=params;
                ctx=ctx||this;
                var self=this;
                var done=false;
                var defer=$q.defer();
                self.promise=defer.promise;
                self.execute=function(){
                    try {
                        var p = myAsyncFunc.apply(ctx, myParams);
                        if (p.then) {
                            p.then(function () {
                                done=true;
                                bucket.removeMe(self);
                                defer.resolve();
                            },function(err){
                                done=true;
                                bucket.removeMe(self);
                                defer.reject(err);
                            });
                        }
                        else {
                            done=true;
                            bucket.removeMe(self);
                            defer.resolve();

                        }
                    } catch (e) {
                        done=true;
                        bucket.removeMe(self);
                        defer.reject();
                    }
                };
            }

            function executeNextWrapper(){
                if(!currentWrapper && funcs.length>0){
                    currentWrapper=funcs.shift();
                    currentWrapper.execute();
                }
            }

            self.stack=function(func,params,ctx){
                var aWrapper=new asyncWrapper(func,params,ctx||self,self);
                funcs.push(aWrapper);
                try{
                    executeNextWrapper();
                    return aWrapper;
                }
                catch(err){
                    funcs.pop();
                    throw err;
                }


            };

            self.removeMe=function(wrapper){
                funcs.shift();
                currentWrapper=null;
                executeNextWrapper();
            };

            self.clear=function(){
                funcs.splice(0,funcs.length);
            }

        }

        self.createStacker=function(){
            return new stacker();
        }
    }]);
})(this);